#!/usr/bin/env node
/**
 * Script to generate Postman collection from Swagger spec
 * Run: node scripts/generate-postman-collection.js
 * 
 * Output: postman/Fairy-Garden-API.postman_collection.json
 */

const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../src/config/swagger.js');

// Create postman directory if it doesn't exist
const postmanDir = path.join(__dirname, '..', 'postman');
if (!fs.existsSync(postmanDir)) {
  fs.mkdirSync(postmanDir, { recursive: true });
}

/**
 * Convert Swagger/OpenAPI spec to Postman Collection v2.1
 */
function convertSwaggerToPostman(swaggerSpec) {
  const collection = {
    info: {
      name: swaggerSpec.info.title || 'API Collection',
      description: swaggerSpec.info.description || '',
      version: swaggerSpec.info.version || '1.0.0',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{JWT_TOKEN}}',
          type: 'string'
        }
      ]
    },
    item: [],
    variable: [
      {
        key: 'BASE_URL',
        value: `${swaggerSpec.servers?.[0]?.url || 'http://localhost:3000'}`,
        type: 'string'
      },
      {
        key: 'JWT_TOKEN',
        value: '',
        type: 'string',
        description: 'JWT token - obtained after login'
      }
    ]
  };

  // Group endpoints by tag
  const tagGroups = {};
  
  if (swaggerSpec.paths) {
    Object.entries(swaggerSpec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (method.toLowerCase() === 'parameters') return;
        
        const tag = operation.tags?.[0] || 'Other';
        if (!tagGroups[tag]) {
          tagGroups[tag] = [];
        }

        const request = {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text'
            },
            {
              key: 'Accept',
              value: 'application/json',
              type: 'text'
            }
          ],
          url: {
            raw: `{{BASE_URL}}${path}`,
            host: ['{{BASE_URL}}'],
            path: path.split('/').filter(p => p)
          }
        };

        // Add authentication if required
        if (operation.security) {
          request.header.push({
            key: 'Authorization',
            value: 'Bearer {{JWT_TOKEN}}',
            type: 'text'
          });
        }

        // Add path parameters
        if (operation.parameters) {
          operation.parameters.forEach(param => {
            if (param.in === 'path') {
              request.url.path.push(`:${param.name}`);
            } else if (param.in === 'query') {
              if (!request.url.query) request.url.query = [];
              request.url.query.push({
                key: param.name,
                value: '',
                disabled: true
              });
            }
          });
        }

        // Add request body
        if (operation.requestBody) {
          const schema = operation.requestBody.content?.['application/json']?.schema;
          request.body = {
            mode: 'raw',
            raw: JSON.stringify(generateExampleBody(schema), null, 2),
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }

        tagGroups[tag].push({
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          description: operation.description || '',
          request
        });
      });
    });
  }

  // Convert tag groups to collection items
  Object.entries(tagGroups).forEach(([tag, requests]) => {
    collection.item.push({
      name: tag,
      description: `${tag} endpoints`,
      item: requests
    });
  });

  return collection;
}

/**
 * Generate example body from schema
 */
function generateExampleBody(schema, depth = 0) {
  if (depth > 5) return {}; // Prevent infinite recursion
  
  if (!schema) return {};

  switch (schema.type) {
    case 'object':
      const obj = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, prop]) => {
          obj[key] = generateExampleBody(prop, depth + 1);
        });
      }
      return obj;

    case 'array':
      return [generateExampleBody(schema.items, depth + 1)];

    case 'string':
      return schema.example || 'string';

    case 'integer':
      return schema.example || 0;

    case 'number':
      return schema.example || 0.0;

    case 'boolean':
      return schema.example || true;

    default:
      return schema.example || '';
  }
}

try {
  const postmanCollection = convertSwaggerToPostman(swaggerSpec);
  
  const outputPath = path.join(postmanDir, 'Fairy-Garden-API.postman_collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));
  
  console.log(`✓ Postman collection generated successfully`);
  console.log(`✓ Location: ${outputPath}`);
  console.log(`\nTo import into Postman:`);
  console.log(`1. Open Postman`);
  console.log(`2. Click "Import" button`);
  console.log(`3. Select the generated collection file`);
  console.log(`4. Set BASE_URL and JWT_TOKEN variables`);
  console.log(`5. Start testing!`);
} catch (error) {
  console.error('✗ Error generating Postman collection:', error.message);
  process.exit(1);
}
