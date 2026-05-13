/**
 * Empire OS — barrel exports for server modules.
 * Client components should import only types / skills metadata via dedicated paths if needed.
 */
export type { SkillId, EmpireCategory, EmpireEventType, EmpireEventPayload, SkillDefinition } from './types';
export { SKILL_IDS } from './types';
export { EMPIRE_SKILLS, CATEGORY_LABELS, skillById } from './skills';
export { emitEmpireEvent, emitSkillSignal, recordEmpireEvent } from './emit';
export { getEmpireMetrics } from './metrics';
export { buildComplementaryRecommendations } from './recommendations-engine';
export { getEmpireOutboundWebhookUrls, getEmpireInboundSecret } from './config';
