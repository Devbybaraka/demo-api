const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('./middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, category } = req.query;
  const where = {};

  if (typeof search === 'string' && search.trim()) {
    where.question = { contains: search.trim(), mode: 'insensitive' };
  }
  if (typeof category === 'string' && category.trim()) {
    where.category = category.trim();
  }

  const markets = await prisma.market.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(markets);
});

router.post('/', auth, async (req, res) => {
  const { question, description, category, endDate } = req.body || {};
  const parsedEndDate = new Date(endDate);

  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: 'A question is required' });
  }
  if (Number.isNaN(parsedEndDate.getTime()) || parsedEndDate <= new Date()) {
    return res.status(400).json({ message: 'endDate must be a valid future date' });
  }

  const market = await prisma.market.create({
    data: {
      question: question.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      category: typeof category === 'string' && category.trim() ? category.trim() : 'general',
      endDate: parsedEndDate,
      createdById: req.user,
    },
  });
  res.status(201).json(market);
});

router.get('/:id', async (req, res) => {
  const market = await prisma.market.findUnique({
    where: { id: req.params.id },
    include: {
      bets: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!market) {
    return res.status(404).json({ message: 'Market not found' });
  }

  const yesOdds = market.yesPool > 0 ? market.totalPool / market.yesPool : 2;
  const noOdds = market.noPool > 0 ? market.totalPool / market.noPool : 2;
  res.json({ market, odds: { YES: yesOdds, NO: noOdds } });
});

router.post('/:id/bet', auth, async (req, res) => {
  const { outcome, amount } = req.body || {};
  const numericAmount = Number(amount);

  if (!['YES', 'NO'].includes(outcome) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'outcome must be YES or NO and amount must be a positive number' });
  }

  const result = await prisma.$transaction(async (transaction) => {
    const market = await transaction.market.findUnique({ where: { id: req.params.id } });
    if (!market) {
      return { error: 'Market not found', status: 404 };
    }
    if (market.resolved || market.endDate <= new Date()) {
      return { error: 'Market is closed', status: 400 };
    }

    const bet = await transaction.bet.create({
      data: {
        marketId: market.id,
        userId: req.user,
        outcome,
        amount: numericAmount,
      },
    });
    await transaction.market.update({
      where: { id: market.id },
      data: {
        totalPool: { increment: numericAmount },
        ...(outcome === 'YES'
          ? { yesPool: { increment: numericAmount } }
          : { noPool: { increment: numericAmount } }),
      },
    });
    return { bet };
  });

  if (result.error) {
    return res.status(result.status).json({ message: result.error });
  }
  res.status(201).json(result.bet);
});

router.put('/:id/resolve', auth, async (req, res) => {
  const { winningOutcome } = req.body || {};
  if (!['YES', 'NO'].includes(winningOutcome)) {
    return res.status(400).json({ message: 'winningOutcome must be YES or NO' });
  }

  const market = await prisma.market.findUnique({ where: { id: req.params.id } });
  if (!market) {
    return res.status(404).json({ message: 'Market not found' });
  }
  if (market.createdById !== req.user) {
    return res.status(403).json({ message: 'Only the market creator can resolve it' });
  }
  if (market.resolved) {
    return res.status(400).json({ message: 'Market is already resolved' });
  }

  const resolvedMarket = await prisma.market.update({
    where: { id: market.id },
    data: { resolved: true, winningOutcome },
  });
  res.json(resolvedMarket);
});

module.exports = router;
