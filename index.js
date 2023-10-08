const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 3005;
const rateLimit = require('express-rate-limit');
const expressListEndpoints = require('express-list-endpoints');
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000,// it is 1 minute
	max: 5, // 5 requests allowed
})

app.use(morgan('combined'));
app.use(limiter);

// checking authentication before going to booking service
app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isauthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
})
app.use('/bookingsevice', createProxyMiddleware({ target: 'http://localhost:3001/', changeOrigin: true}));

app.get('/home', (req, res) => {
    return res.json({message: 'OK'});
})
const routes = expressListEndpoints(app);

console.log(routes);
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});