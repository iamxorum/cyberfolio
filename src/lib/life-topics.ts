import { features } from '@/config';

export function lifeTopics(): string {
  const topics = [features.strava && 'running', 'hobbies', features.discography && 'music'].filter((t): t is string => !!t);
  return topics.length > 1 ? `${topics.slice(0, -1).join(', ')} and ${topics[topics.length - 1]}` : topics[0];
}
