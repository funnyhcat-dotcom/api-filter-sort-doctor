export function requireScope(user, scope) {
  if (!user?.scopes?.includes(scope)) {
    const error = new Error('insufficient_scope');
    error.status = 403;
    throw error;
  }
}
export function routes(app) {
  app.get('/customers', authorize, (req, res) => { requireScope(req.user, 'customers:read'); res.json([]); });
  app.post('/customers', authorize, (req, res) => { requireScope(req.user, 'customers:write'); res.status(201).json({}); });
}
