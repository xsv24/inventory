/**
 * Application configuration
 */
export default {
  PORT: process.env.LOCAL_TESTING_PORT || 8044,
  BUILD_NUMBER: process.env.BUILD_NUMBER || 'local',
  COMMIT_HASH:
    process.env.COMMIT_HASH || 'df5ac41cdcae4578e7e17dad2bc4a8b94124d4d6',
};
