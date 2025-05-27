import { MongoClient } from 'mongodb'
import { MONGO_URI } from 'src/config/env-vars'

export const mongoDb = await MongoClient.connect(MONGO_URI)
export const db = mongoDb.db('base-nodejs-test')

type FrameIoIconikAssetRelation = {
  frameIoAssetId: string
  iconikAssetId: string
}

export const assetCollection =
  db.collection<FrameIoIconikAssetRelation>('assets')

type FrameIoIconikCommentRelation = {
  frameIoCommentId: string
  iconikCommentId: string
  lastUpdatedAt: Date
  iconikAssetId: string
  frameIoAssetId: string
}

export const commentCollection =
  db.collection<FrameIoIconikCommentRelation>('comments')

type DeletedComment = {
  frameIoCommentId: string
  deletedAt: Date
}

export const deletedCommentCollection =
  db.collection<DeletedComment>('deleted-comments')
