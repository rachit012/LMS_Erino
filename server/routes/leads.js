const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');

const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const buildWhereClause = (filters) => {
  const conditions = {};

  if (filters.email) {
    if (filters.email.operator === 'equals') {
      conditions.email = filters.email.value;
    } else if (filters.email.operator === 'contains') {
      conditions.email = { $regex: filters.email.value, $options: 'i' };
    }
  }

  if (filters.company) {
    if (filters.company.operator === 'equals') {
      conditions.company = filters.company.value;
    } else if (filters.company.operator === 'contains') {
      conditions.company = { $regex: filters.company.value, $options: 'i' };
    }
  }

  if (filters.city) {
    if (filters.city.operator === 'equals') {
      conditions.city = filters.city.value;
    } else if (filters.city.operator === 'contains') {
      conditions.city = { $regex: filters.city.value, $options: 'i' };
    }
  }

  if (filters.status) {
    if (filters.status.operator === 'equals') {
      conditions.status = filters.status.value;
    } else if (filters.status.operator === 'in') {
      conditions.status = { $in: filters.status.value };
    }
  }

  if (filters.source) {
    if (filters.source.operator === 'equals') {
      conditions.source = filters.source.value;
    } else if (filters.source.operator === 'in') {
      conditions.source = { $in: filters.source.value };
    }
  }

  if (filters.score) {
    if (filters.score.operator === 'equals') {
      conditions.score = filters.score.value;
    } else if (filters.score.operator === 'gt') {
      conditions.score = { $gt: filters.score.value };
    } else if (filters.score.operator === 'lt') {
      conditions.score = { $lt: filters.score.value };
    } else if (filters.score.operator === 'between') {
      conditions.score = { $gte: filters.score.value[0], $lte: filters.score.value[1] };
    }
  }

  if (filters.lead_value) {
    if (filters.lead_value.operator === 'equals') {
      conditions.lead_value = filters.lead_value.value;
    } else if (filters.lead_value.operator === 'gt') {
      conditions.lead_value = { $gt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'lt') {
      conditions.lead_value = { $lt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'between') {
      conditions.lead_value = { $gte: filters.lead_value.value[0], $lte: filters.lead_value.value[1] };
    }
  }

  if (filters.created_at) {
    if (filters.created_at.operator === 'on') {
      const date = new Date(filters.created_at.value);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      conditions.createdAt = { $gte: date, $lt: nextDate };
    } else if (filters.created_at.operator === 'before') {
      conditions.createdAt = { $lt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'after') {
      conditions.createdAt = { $gt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'between') {
      conditions.createdAt = { 
        $gte: new Date(filters.created_at.value[0]), 
        $lte: new Date(filters.created_at.value[1]) 
      };
    }
  }

  if (filters.last_activity_at) {
    if (filters.last_activity_at.operator === 'on') {
      const date = new Date(filters.last_activity_at.value);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      conditions.last_activity_at = { $gte: date, $lt: nextDate };
    } else if (filters.last_activity_at.operator === 'before') {
      conditions.last_activity_at = { $lt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'after') {
      conditions.last_activity_at = { $gt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'between') {
      conditions.last_activity_at = { 
        $gte: new Date(filters.last_activity_at.value[0]), 
        $lte: new Date(filters.last_activity_at.value[1]) 
      };
    }
  }

  if (filters.is_qualified !== undefined) {
    conditions.is_qualified = filters.is_qualified;
  }

  return conditions;
};

router.post('/', authenticateToken, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('company').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('state').notEmpty().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').isInt({ min: 0, max: 100 }),
  body('lead_value').isFloat({ min: 0 }),
  body('is_qualified').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName, lastName, email, phone, company, city, state,
    source, status, score, lead_value, last_activity_at, is_qualified
  } = req.body;

  try {
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }

    const lead = new Lead({
      user_id: req.user._id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      company,
      city,
      state,
      source,
      status,
      score,
      lead_value,
      last_activity_at: last_activity_at || null,
      is_qualified
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    const conditions = buildWhereClause(filters);
    conditions.user_id = req.user._id;

    const total = await Lead.countDocuments(conditions);
    const leads = await Lead.find(conditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: leads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user_id: req.user._id });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('company').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('state').notEmpty().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').isInt({ min: 0, max: 100 }),
  body('lead_value').isFloat({ min: 0 }),
  body('is_qualified').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName, lastName, email, phone, company, city, state,
    source, status, score, lead_value, last_activity_at, is_qualified
  } = req.body;

  try {
    const existingLead = await Lead.findOne({ email, _id: { $ne: req.params.id } });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        company,
        city,
        state,
        source,
        status,
        score,
        lead_value,
        last_activity_at: last_activity_at || null,
        is_qualified
      },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
