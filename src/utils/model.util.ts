import { Model } from 'mongoose';
export async function findPaginatedItems(
  dbModel: Model<any>,
  itemIds: string[],
  page: number,
  limit: number,
  keywords: string,
): Promise<any> {
  const regex = new RegExp(keywords, 'i');
  const totalCount = await dbModel.countDocuments({ $or: [{ 'descriptor.name': { $regex: regex } }] });
  const skip = (page - 1) * limit;

  const items = await dbModel
    // .find({ _id: { $in: itemIds } })
    .find({ 'descriptor.name': { $regex: regex } })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { totalCount, skip, limit, items };
}
