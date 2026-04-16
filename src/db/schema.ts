import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const attendees = sqliteTable(
  'attendees',
  {
    id: text('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email').unique(),
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_attendees_email').on(t.email), index('idx_attendees_created_at').on(t.createdAt)]
);

export const harnessProfiles = sqliteTable(
  'harness_profiles',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    purpose: text('purpose').notNull(),
    questionStrategy: text('question_strategy').notNull(),
    riskPosture: text('risk_posture').notNull(),
    preferredClarificationModes: text('preferred_clarification_modes').notNull().default('[]'),
    outputStyle: text('output_style').notNull(),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_harness_profiles_name').on(t.name), index('idx_harness_profiles_is_default').on(t.isDefault)]
);

export const surveyResponses = sqliteTable(
  'survey_responses',
  {
    id: text('id').primaryKey(),
    attendeeId: text('attendee_id')
      .notNull()
      .references(() => attendees.id, { onDelete: 'cascade' }),
    sessionType: text('session_type').notNull().default('profile'),
    questionnaireVersion: text('questionnaire_version').notNull().default('v1'),
    tenureYears: integer('tenure_years'),
    learningStyle: text('learning_style'),
    shapedBy: text('shaped_by'),
    peakPerformance: text('peak_performance'),
    motivation: text('motivation'),
    uniqueQuality: text('unique_quality'),
    harnessProfileId: text('harness_profile_id').references(() => harnessProfiles.id, { onDelete: 'set null' }),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] })
      .notNull()
      .default('pending'),
    moderatedAt: text('moderated_at'),
    testData: integer('test_data', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_survey_responses_attendee_id').on(t.attendeeId),
    index('idx_survey_responses_created_at').on(t.createdAt),
  ]
);


export const surveyResponseIntentCategories = sqliteTable(
  'survey_response_intent_categories',
  {
    id: text('id').primaryKey(),
    responseId: text('response_id')
      .notNull()
      .references(() => surveyResponses.id, { onDelete: 'cascade' }),
    category: text('category', {
      enum: ['questions', 'concerns', 'needs', 'accomplishments', 'stats', 'constraints', 'signals'],
    }).notNull(),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_survey_response_intent_categories_response_id').on(t.responseId),
    index('idx_survey_response_intent_categories_category').on(t.category),
    uniqueIndex('survey_response_intent_categories_response_category_unique').on(t.responseId, t.category),
  ]
);

export const peakPerformanceDefinitions = sqliteTable(
  'peak_performance_definitions',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_peak_performance_definitions_type').on(t.type),
    uniqueIndex('peak_performance_definitions_type_title_unique').on(t.type, t.title),
  ]
);

export const moderation = sqliteTable(
  'moderation',
  {
    id: text('id').primaryKey(),
    responseId: text('response_id')
      .notNull()
      .references(() => surveyResponses.id, { onDelete: 'cascade' }),
    fieldName: text('field_name').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    moderatorId: text('moderator_id').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_moderation_response_id').on(t.responseId),
    index('idx_moderation_status').on(t.status),
    uniqueIndex('moderation_response_field_unique').on(t.responseId, t.fieldName),
  ]
);

export const alignmentContextItems = sqliteTable(
  'alignment_context_items',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body'),
    /** JSON array of strings */
    tags: text('tags').notNull().default('[]'),
    priority: integer('priority'),
    status: text('status', { enum: ['draft', 'active', 'archived'] }).notNull().default('draft'),
    linkedNodeId: text('linked_node_id'),
    attendeeId: text('attendee_id').references(() => attendees.id, { onDelete: 'set null' }),
    source: text('source', { enum: ['ui', 'import', 'api'] }).notNull(),
    createdBy: text('created_by'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_alignment_context_items_status').on(t.status),
    index('idx_alignment_context_items_created_at').on(t.createdAt),
  ]
);

/** Async agent clarification queue (distinct from Sync Session / survey POST). */
export const clarificationRequests = sqliteTable(
  'clarification_requests',
  {
    id: text('id').primaryKey(),
    /** JSON: ClarificationQuestionSpec */
    questionSpec: text('question_spec').notNull(),
    status: text('status', { enum: ['pending', 'answered', 'superseded'] })
      .notNull()
      .default('pending'),
    /** JSON: ClarificationResolution */
    resolution: text('resolution'),
    /** JSON: ClarificationAgentMetadata */
    agentMetadata: text('agent_metadata').notNull().default('{}'),
    linkedNodeId: text('linked_node_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    resolvedAt: text('resolved_at'),
  },
  (t) => [
    index('idx_clarification_requests_status').on(t.status),
    index('idx_clarification_requests_created_at').on(t.createdAt),
  ]
);

export const studyDecks = sqliteTable(
  'study_decks',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_study_decks_created_at').on(t.createdAt)]
);

export const studyCards = sqliteTable(
  'study_cards',
  {
    id: text('id').primaryKey(),
    deckId: text('deck_id')
      .notNull()
      .references(() => studyDecks.id, { onDelete: 'cascade' }),
    front: text('front').notNull(),
    back: text('back').notNull(),
    sourceUrl: text('source_url'),
    repoPath: text('repo_path'),
    alignmentContextItemId: text('alignment_context_item_id').references(() => alignmentContextItems.id, {
      onDelete: 'set null',
    }),
    ease: real('ease').notNull().default(2.5),
    intervalDays: integer('interval_days').notNull().default(0),
    repetitions: integer('repetitions').notNull().default(0),
    dueAt: text('due_at').notNull(),
    lastReviewedAt: text('last_reviewed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('idx_study_cards_deck_id').on(t.deckId),
    index('idx_study_cards_due_at').on(t.dueAt),
  ]
);

export const studyReviews = sqliteTable(
  'study_reviews',
  {
    id: text('id').primaryKey(),
    cardId: text('card_id')
      .notNull()
      .references(() => studyCards.id, { onDelete: 'cascade' }),
    rating: text('rating', { enum: ['again', 'hard', 'good', 'easy'] }).notNull(),
    reviewedAt: text('reviewed_at').notNull(),
    easeAfter: real('ease_after').notNull(),
    intervalDaysAfter: integer('interval_days_after').notNull(),
  },
  (t) => [
    index('idx_study_reviews_card_id').on(t.cardId),
    index('idx_study_reviews_reviewed_at').on(t.reviewedAt),
  ]
);
