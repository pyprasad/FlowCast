-- Create separate databases for each service
CREATE DATABASE creatorflow_auth;
CREATE DATABASE creatorflow_billing;
CREATE DATABASE creatorflow_api_keys;
CREATE DATABASE creatorflow_platform;
CREATE DATABASE creatorflow_video;
CREATE DATABASE creatorflow_scheduler;
CREATE DATABASE creatorflow_analytics;
CREATE DATABASE creatorflow_comments;
CREATE DATABASE creatorflow_ai;
CREATE DATABASE creatorflow_gateway;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE creatorflow_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_billing TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_api_keys TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_platform TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_video TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_scheduler TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_analytics TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_comments TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_ai TO postgres;
GRANT ALL PRIVILEGES ON DATABASE creatorflow_gateway TO postgres;
