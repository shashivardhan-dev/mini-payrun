FROM public.ecr.aws/lambda/nodejs:20

# Copy app
WORKDIR /var/task
COPY package*.json ./
RUN npm ci
COPY . .

# Build TS
RUN npm run build

# Set the Lambda handler file (dist/handler.handler)
CMD [ "dist/handler.handler" ]
