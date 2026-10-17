const getSessionDeadline = (session) => new Date(session.startedAt.getTime() + session.duration * 60000);

module.exports = getSessionDeadline;
