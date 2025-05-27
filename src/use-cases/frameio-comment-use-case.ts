import type { Channel, Message } from 'amqplib'
import { frameIoApi } from '../utils/frame-io-client.js'
import type { FrameIoCommentEventPayload } from '../utils/frameio-comment-event-payload-schema.js'
import { iconikApi } from '../utils/iconik-client.js'
import {
  assetCollection,
  commentCollection,
  deletedCommentCollection,
} from '../utils/mongo-db.js'

const deletedCommentsRepository = {
  addToDeleted: async (commentId: string) => {
    await deletedCommentCollection.updateOne(
      {
        frameIoCommentId: commentId,
      },
      {
        $set: { deletedAt: new Date() },
      },
      { upsert: true },
    )
  },
  isDeleted: async (commentId: string) => {
    const comment = await deletedCommentCollection.findOne({
      frameIoCommentId: commentId,
    })
    return !!comment
  },
}

async function handleCommentCreated(payload: FrameIoCommentEventPayload) {
  const localComment = await commentCollection.findOne({
    frameIoCommentId: payload.resource.id,
  })

  if (localComment) {
    console.log('Comment already added. Skipping')
    return
  }

  const frameIoComment = await frameIoApi.comments.getComment(
    payload.resource.id,
  )
  if (!frameIoComment) {
    console.log('Comment not found in frame io. Probably deleted')
    return
  }

  const dbAsset = await assetCollection.findOne({
    frameIoAssetId: frameIoComment.asset_id,
  })
  if (!dbAsset) {
    throw new Error('Asset not found in database')
  }

  if (
    (await deletedCommentsRepository.isDeleted(frameIoComment.id)) ||
    (frameIoComment.parent_id &&
      (await deletedCommentsRepository.isDeleted(frameIoComment.parent_id)))
  ) {
    console.log('Comment is already deleted')
    return
  }

  const iconikParentComment = frameIoComment.parent_id
    ? await commentCollection.findOne({
        frameIoCommentId: frameIoComment.parent_id,
      })
    : null

  if (frameIoComment.parent_id && !iconikParentComment) {
    throw new Error('Parent comment not found')
  }

  const addedComment = await iconikApi.comments.addComment({
    assetId: dbAsset.iconikAssetId,
    commentText: frameIoComment.text,
    parentId: iconikParentComment?.iconikCommentId,
  })

  await commentCollection.insertOne({
    frameIoCommentId: frameIoComment.id,
    iconikCommentId: addedComment.id,
    lastUpdatedAt: frameIoComment.updated_at,
    iconikAssetId: dbAsset.iconikAssetId,
    frameIoAssetId: frameIoComment.asset_id,
  })
}

async function handleCommentUpdated(payload: FrameIoCommentEventPayload) {
  const localComment = await commentCollection.findOne({
    frameIoCommentId: payload.resource.id,
  })

  if (!localComment) {
    console.log('Comment not found in database')
    return
  }

  const frameIoComment = await frameIoApi.comments.getComment(
    payload.resource.id,
  )
  if (!frameIoComment) {
    console.log('Comment not found in frame io, probably deleted')
    return
  }

  if (frameIoComment.updated_at <= localComment.lastUpdatedAt) {
    console.log('Comment is already updated')
    return
  }

  const dbAsset = await assetCollection.findOne({
    frameIoAssetId: frameIoComment.asset_id,
  })
  if (!dbAsset) {
    throw new Error('Asset not found in database')
  }

  if (
    (await deletedCommentsRepository.isDeleted(frameIoComment.id)) ||
    (frameIoComment.parent_id &&
      (await deletedCommentsRepository.isDeleted(frameIoComment.parent_id)))
  ) {
    console.log('Comment is deleted')
    return
  }

  const dbComment = await commentCollection.findOne({
    frameIoCommentId: payload.resource.id,
  })
  if (!dbComment) {
    throw new Error('Comment not found in database')
  }

  await iconikApi.comments.editComment({
    commentId: dbComment.iconikCommentId,
    assetId: dbAsset.iconikAssetId,
    commentText: frameIoComment.text,
    completed: frameIoComment.completed,
  })

  await commentCollection.updateOne(
    {
      frameIoCommentId: payload.resource.id,
    },
    {
      $set: {
        lastUpdatedAt: frameIoComment.updated_at,
      },
    },
    { upsert: true },
  )
}

async function handleCommentDeleted(payload: FrameIoCommentEventPayload) {
  const dbComment = await commentCollection.findOne({
    frameIoCommentId: payload.resource.id,
  })

  if (!dbComment) {
    throw new Error('Comment not found in database')
  }

  await deletedCommentsRepository.addToDeleted(payload.resource.id)

  await iconikApi.comments.deleteComment({
    commentId: dbComment.iconikCommentId,
    assetId: dbComment.iconikAssetId,
  })
}

export async function frameIoCommentUseCase({
  payload,
  channel,
  message,
}: {
  payload: FrameIoCommentEventPayload
  channel: Channel
  message: Message
}) {
  try {
    switch (payload.type) {
      case 'comment.created':
        await handleCommentCreated(payload)
        break
      case 'comment.updated':
      case 'comment.uncompleted':
      case 'comment.completed':
        await handleCommentUpdated(payload)
        break
      case 'comment.deleted':
        await handleCommentDeleted(payload)
        break
    }
    channel.ack(message)
  } catch (error) {
    console.error(error)
  }
}
