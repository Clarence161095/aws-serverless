Để cấu hình API Gateway Lambda authorizer sao cho chuyển tiếp được toàn bộ thông tin event và context vào Lambda function tiếp theo, bạn cần thực hiện các bước sau trên AWS Console:

## Cấu hình API Gateway

1. Đăng nhập vào AWS Console và mở API Gateway.

2. Chọn API của bạn và vào phần "Authorizers".

3. Chọn Lambda authorizer đang sử dụng và cập nhật cấu hình:

   - Đảm bảo "Lambda Event Payload" được đặt là "Request".
   - Trong phần "Identity Sources", thêm các header, query string, stage/context variables cần thiết.

4. Vào phần "Resources" của API, chọn method cần authorizer.

5. Trong tab "Method Request":

   - Đặt "Authorization" là Lambda authorizer đã cấu hình.
   - Trong "Request Validator", chọn "Validate query string parameters and headers".

6. Trong tab "Integration Request":

   - Chọn "Use Lambda Proxy integration".
   - Trong phần "Mapping Templates", thêm một template mới với Content-Type là "application/json".

7. Sử dụng template sau để chuyển tiếp toàn bộ thông tin:

```json
#set($allParams = $input.params())
{
    "body": $input.json('$'),
    "method": "$context.httpMethod",
    "principalId": "$context.authorizer.principalId",
    "stage": "$context.stage",
    "cognitoPoolClaims" : {
       "sub": "$context.authorizer.claims.sub"
    },
    "headers": {
        #foreach($param in $input.params().header.keySet())
        "$param": "$util.escapeJavaScript($input.params().header.get($param))"
        #if($foreach.hasNext),#end
        #end
    },
    "queryStringParameters": {
        #foreach($param in $input.params().querystring.keySet())
        "$param": "$util.escapeJavaScript($input.params().querystring.get($param))"
        #if($foreach.hasNext),#end
        #end
    },
    "pathParameters": {
        #foreach($param in $input.params().path.keySet())
        "$param": "$util.escapeJavaScript($input.params().path.get($param))"
        #if($foreach.hasNext),#end
        #end
    },
    "authorizerContext": {
        #foreach($param in $context.authorizer.keySet())
        "$param": "$util.escapeJavaScript($context.authorizer.get($param))"
        #if($foreach.hasNext),#end
        #end
    },
    "requestContext": {
        "accountId": "$context.identity.accountId",
        "apiId": "$context.apiId",
        "httpMethod": "$context.httpMethod",
        "identity": {
            "accessKey": "$context.identity.accessKey",
            "accountId": "$context.identity.accountId",
            "apiKey": "$context.identity.apiKey",
            "caller": "$context.identity.caller",
            "cognitoAuthenticationProvider": "$context.identity.cognitoAuthenticationProvider",
            "cognitoAuthenticationType": "$context.identity.cognitoAuthenticationType",
            "cognitoIdentityId": "$context.identity.cognitoIdentityId",
            "cognitoIdentityPoolId": "$context.identity.cognitoIdentityPoolId",
            "sourceIp": "$context.identity.sourceIp",
            "user": "$context.identity.user",
            "userAgent": "$context.identity.userAgent",
            "userArn": "$context.identity.userArn"
        },
        "requestId": "$context.requestId",
        "resourceId": "$context.resourceId",
        "resourcePath": "$context.resourcePath",
        "stage": "$context.stage"
    }
}
```

8. Lưu các thay đổi và triển khai lại API.

## Cập nhật Lambda Function

Cập nhật Lambda function để xử lý event mới:

```javascript
export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Xử lý thông tin từ event
  const { body, method, principalId, headers, queryStringParameters, pathParameters, authorizerContext } = event;

  // Thực hiện logic xử lý dựa trên các thông tin nhận được

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Lambda!",
      principalId: principalId,
      method: method,
      // Thêm các thông tin khác nếu cần
    }),
  };
  return response;
};
```

Với cấu hình này, Lambda function của bạn sẽ nhận được đầy đủ thông tin từ request gốc, bao gồm cả thông tin từ authorizer.
