// verifySession.js

module.exports = async function verifySession(req, res, next) {
  const { data, error } = await req.supabase.auth.getUser();

  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: "Unauthorized or JWT expired" });
  }

  req.user = data.user; // Attach the user object to the request
  next();
};
