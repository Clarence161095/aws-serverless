export const handler = async (event) => {
  console.log("Sự kiện:", JSON.stringify(event, null, 2));

  let token;

  // Kiểm tra xem event có phải là kiểu TOKEN hay REQUEST
  if (event.type === "TOKEN") {
    token = event.authorizationToken;
  } else if (event.type === "REQUEST") {
    token = event.headers.Authorization;
  } else {
    throw new Error("Loại sự kiện không hợp lệ");
  }

  console.log("Token:", token);r

  // Kiểm tra token
  if (checkToken(token)) {
    return generatePolicy("user", "Allow", event.methodArn);
  } else {
    return generatePolicy("user", "Deny", event.methodArn);
  }
};

const checkToken = (token) => {
  // Kiểm tra token với secret key
  return token === "This is my Token";
};

// Hàm tạo policy
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId: principalId,
  };

  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }

  // Có thể thêm thông tin bổ sung vào context
  authResponse.context = {
    name: "Tuan",
    age: 19,
    booleanKey: true,
  };

  return authResponse;
};
