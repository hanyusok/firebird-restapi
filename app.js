const mtswaitRoutes = require('./routes/mtswaitRoutes');
const mtrRoutes = require('./routes/mtrRoutes');

// Routes
app.use('/api/mtswait', mtswaitRoutes);
app.use('/api/mtr', mtrRoutes); 