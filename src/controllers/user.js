const asyncHandler = require('express-async-handler');
const dayjs = require('dayjs');
const UserModel = require('../models/user');
const ErrorResponse = require('../utils/error-response');


// @desc   Get Data (without pagination and filtering)
// @route  GET /api/v1/user/1
// @access Public
exports.getData1 = asyncHandler(async (req, res, next) => {
  const data = await UserModel.find({});
  if (!data) return next(new ErrorResponse('No data found', 404));

  res.status(200).json(data);
});

// @desc   Get Data (custom pagination and filtering)
// @route  GET /api/v1/user/2
// @access Public
exports.getData2 = asyncHandler(async (req, res, next) => {
  const { limit: l, page: p, sort: s, sortKey, fromDate: fd, toDate: td, createdAgo: ca, status: st, search: q, searchKey, blocked: b, emailVerified: e } = req.query;
  const limit = l ? parseInt(l) : 10;
  const page = p ? parseInt(p) : 1;
  const sort = s ? parseInt(s) : -1;
  const fromDate = fd || null;
  const toDate = td || null;
  const createdAgo = ca || null;
  const status = st || null;
  const search = q || null;
  const blocked = b || null;
  const emailVerified = e || null;

  const query = {};
  if (fromDate && toDate) {
    const startOf = dayjs(fromDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endOf = dayjs(toDate, 'YYYY-MM-DD').startOf('day').toDate();
    query.createdAt = { $gt: startOf, $lte: endOf };
  }

  if (createdAgo) query.createdAt = { $gt: dayjs().subtract(createdAgo, 'days').startOf('day').toDate() };

  if (status) query.status = status === 'dead' ? { $in: ['dead', 'deceased', 'lifeless', 'no more'] } : status;

  if (blocked) query.isBlocked = blocked === '1';

  if (emailVerified) query.isEmailVerified = emailVerified === '1';

  if (search) query[searchKey || 'email'] = { $regex: `.*${search}.*`, $options: 'i' };

  const querySort = {};
  if (sortKey) {
    if (sortKey === 'name') querySort.name = sort;
    else if (sortKey === 'email') querySort.email = sort;
    else;
  } else querySort.createdAt = sort;

  // const data = await UserModel.find(query).collation({ locale: 'en' }).sort({[sortKey || 'createdAt']: sort}).skip((page - 1) * limit).limit(limit);
  const data = await UserModel.find(query).collation({ locale: 'en' }).sort(querySort).skip((page - 1) * limit).limit(limit);
  const totalCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  if (!data) return next(new ErrorResponse('No data found', 404));

  res.status(200).json({ data, totalCount, totalPages, limit, page });
});

// @desc   Get Data (pagination and filtering using aggregation)
// @route  GET /api/v1/user/3
// @access Public
exports.getData3 = asyncHandler(async (req, res, next) => {
  const { limit: l, page: p, sort: s, sortKey, fromDate: fd, toDate: td, createdAgo: ca, status: st, search: q, searchKey, blocked: b, emailVerified: e } = req.query;
  const limit = l ? parseInt(l) : 10;
  const page = p ? parseInt(p) : 1;
  const sort = s ? parseInt(s) : -1;
  const fromDate = fd || null;
  const toDate = td || null;
  const createdAgo = ca || null;
  const status = st || null;
  const search = q || null;
  const blocked = b || null;
  const emailVerified = e || null;

  const query = [];

  if (fromDate && toDate) {
    const startOf = dayjs(fromDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endOf = dayjs(toDate, 'YYYY-MM-DD').startOf('day').toDate();
    query.unshift({ $match: { createdAt: { $gt: startOf, $lte: endOf } } });
  }

  if (createdAgo) query.unshift({ $match: { createdAt: { $gt: dayjs().subtract(createdAgo, 'days').startOf('day').toDate() } } });

  if (status) query.unshift({ $match: { status: status === 'dead' ? { $in: ['dead', 'deceased', 'lifeless', 'no more'] } : status } });

  if (blocked) query.unshift({ $match: { isBlocked: blocked === '1' } });

  if (emailVerified) query.unshift({ $match: { isEmailVerified: emailVerified === '1' } });

  if (search) query.unshift({ $match: { [searchKey || 'email']: { $regex: `.*${search}.*`, $options: 'i' } } });

  const data = await UserModel.aggregate([
    ...query,
    { $sort: { [sortKey || 'createdAt']: sort } },
    {
      $facet: {
        totalCount: [{ $count: "totalCount" }],
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    },
    { $unwind: "$totalCount" },
    {
      $project: {
        totalCount: "$totalCount.totalCount",
        totalPages: { $ceil: { $divide: ["$totalCount.totalCount", limit] } },
        data: 1,
      },
    },
  ]);

  if (!data) return next(new ErrorResponse('No data found', 404));

  res.status(200).json({ data: data[0].data, totalCount: data[0].totalCount, totalPages: data[0].totalPages, limit, page });
});


// @desc   Get Data (pagination and filtering using aggregatePaginate)
// @route  GET /api/v1/user/4
// @access Public
exports.getData4 = asyncHandler(async (req, res, next) => {
  const { limit: l, page: p, sort: s, sortKey, fromDate: fd, toDate: td, createdAgo: ca, status: st, search: q, searchKey, blocked: b, emailVerified: e } = req.query;
  const limit = l ? parseInt(l) : 10;
  const page = p ? parseInt(p) : 1;
  const sort = s ? parseInt(s) : -1;
  const fromDate = fd || null;
  const toDate = td || null;
  const createdAgo = ca || null;
  const status = st || null;
  const search = q || null;
  const blocked = b || null;
  const emailVerified = e || null;

  const query = [
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        gender: 1,
        isBlocked: 1,
        isEmailVerified: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  if (fromDate && toDate) {
    const startOf = dayjs(fromDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endOf = dayjs(toDate, 'YYYY-MM-DD').startOf('day').toDate();
    query.unshift({ $match: { createdAt: { $gt: startOf, $lte: endOf } } })
  }

  if (createdAgo) query.unshift({ $match: { createdAt: { $gt: dayjs().subtract(createdAgo, 'days').startOf('day').toDate() } } });

  if (status) query.unshift({ $match: { status: status === 'dead' ? { $in: ['dead', 'deceased', 'lifeless', 'no more'] } : status } });

  if (blocked) query.unshift({ $match: { isBlocked: blocked === '1' } });

  if (emailVerified) query.unshift({ $match: { isEmailVerified: emailVerified === '1' } });

  if (search) query.unshift({ $match: { [searchKey || 'email']: { $regex: `.*${search}.*`, $options: 'i' } } });

  const aggregate = UserModel.aggregate(query);

  const data = await UserModel.aggregatePaginate(aggregate, {
    page,
    limit,
    sort: { [sortKey || 'createdAt']: sort },
  });

  if (!data) return next(new ErrorResponse('No data found', 404));

  return res.status(200).json(data);
});

// @desc   Set Data
// @route  POST /api/v1/data
// @access Public
exports.setData = asyncHandler(async (req, res, next) => {
  const data = await UserModel.create(req.body);
  if (!data) return next(new ErrorResponse('Something went wrong', 500));

  res.status(200).json(data);
});