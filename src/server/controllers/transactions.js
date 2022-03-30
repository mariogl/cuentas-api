require("dotenv").config();
const debug = require("debug")("cuentas-api:server:controllers:transactions");
const chalk = require("chalk");
const Transaction = require("../../database/models/Transaction");

const getTransactions = async (req, res) => {
  const { search } = req.query;
  try {
    const searchObject = search
      ? {
          description: {
            $regex: search,
            $options: "i",
          },
        }
      : {};

    const transactions = await Transaction.find(searchObject)
      .sort({ date: "desc" })
      .populate("category")
      .populate("tags");

    const positiveTransactionsSum = transactions.reduce(
      (total, transaction) =>
        total + (transaction.quantity > 0 ? transaction.quantity : 0),
      0
    );

    const negativeTransactionsSum = transactions.reduce(
      (total, transaction) =>
        total + (transaction.quantity < 0 ? transaction.quantity : 0),
      0
    );

    const sum = positiveTransactionsSum + negativeTransactionsSum;

    res.json({
      transactions,
      total: transactions.length,
      sum,
      expenses: negativeTransactionsSum,
      income: positiveTransactionsSum,
    });
  } catch (error) {
    debug(chalk.red(error.message));
  }
};

const createTransaction = async (req, res, next) => {
  const transaction = req.body;
  try {
    const createdTransaction = await Transaction.create(transaction);
    res.status(201).json({ transaction: createdTransaction });
  } catch (error) {
    debug(chalk.red(error.message));
    error.statusCode = 400;
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  const transaction = req.body;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transaction.id,
      transaction
    );
    res.json({ transaction: updatedTransaction });
  } catch (error) {
    debug(chalk.red(error.message));
    error.statusCode = 400;
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Transaction.findByIdAndDelete(id);
    res.json({});
  } catch (error) {
    debug(chalk.red(error.message));
    error.statusCode = 400;
    next(error);
  }
};

const deleteAllTransactions = async (req, res, next) => {
  try {
    await Transaction.deleteMany({});
    res.json({ deleted: "ok" });
  } catch (error) {
    debug(chalk.red(error.message));
    next(error);
  }
};

const addTagToTransaction = async (req, res, next) => {
  const { transactionId, tagId } = req.body;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { $push: { tags: tagId } }
    );
    res.json({ transaction: updatedTransaction });
  } catch (error) {
    debug(chalk.red(error.message));
    next(error);
  }
};

const setTransactionsCategory = async (req, res, next) => {
  const { ids: transactionsIds, category: categoryId } = req.body;

  try {
    await Transaction.updateMany(
      { _id: transactionsIds },
      { category: categoryId !== "0" ? null : categoryId }
    );
    res.json({});
  } catch (error) {
    debug(chalk.red(error.message));
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  addTagToTransaction,
  setTransactionsCategory,
};
