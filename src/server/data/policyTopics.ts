/**
 * Policy Topics
 *
 * The main policy areas used for alignment scoring.
 */

import type { PolicyTopic, PolicyTopicId } from '../types';

export const policyTopics: PolicyTopic[] = [
  {
    id: 'housing',
    label: 'Housing & Zoning',
    description: 'Policies regarding affordable housing, zoning laws, and tenant protections.',
    leftAxisLabel: 'More Regulation/Public Support',
    rightAxisLabel: 'Deregulation/Market Based',
  },
  {
    id: 'economy',
    label: 'Economy & Taxes',
    description: 'Views on taxes, business incentives, and economic development strategies.',
    leftAxisLabel: 'Public Services/Higher Tax',
    rightAxisLabel: 'Low Tax/Business Incentives',
  },
  {
    id: 'climate',
    label: 'Climate & Environment',
    description: 'Policies addressing climate change, renewable energy adoption, and environmental regulations.',
    leftAxisLabel: 'Government Action/Regulation',
    rightAxisLabel: 'Market Solutions/Deregulation',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Funding priorities for public schools, school choice, and curriculum standards.',
    leftAxisLabel: 'Public School Funding',
    rightAxisLabel: 'School Choice/Vouchers',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Approaches to healthcare access, insurance markets, and public health funding.',
    leftAxisLabel: 'Expanded Public Access',
    rightAxisLabel: 'Privatized/Limited Scope',
  },
];

export function getPolicyTopicById(topicId: PolicyTopicId): PolicyTopic | null {
  return policyTopics.find((t) => t.id === topicId) || null;
}

export function getAllPolicyTopics(): PolicyTopic[] {
  return policyTopics;
}
