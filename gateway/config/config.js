import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const data = {
    PORT: process.env.PORT || 3000,
    USER_SERVICE_URL: process.env.USER_SERVICE_URL,
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
};

console.log('PORT:', data.PORT);
console.log('USER_SERVICE_URL:', data.USER_SERVICE_URL);
console.log('PRODUCT_SERVICE_URL:', data.PRODUCT_SERVICE_URL);
console.log('ORDER_SERVICE_URL:', data.ORDER_SERVICE_URL);

export default data;
