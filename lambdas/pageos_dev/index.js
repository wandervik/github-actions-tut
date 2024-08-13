//next try 
const http = require('http');
// const version_cloudfront='3.0.1';
let test4 = null;
let secret = null;

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/


// Load the AWS SDK
var AWS = require('aws-sdk'),
    region = "us-east-1",
    secretName = "prod/kinesis",
    decodedBinarySecret;
    
const sts = new AWS.STS();
const ssm = new AWS.SSM();

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

var role_access_key_id = null;
var role_secret_access_key = null;
          
exports.handler = async (event, context, callback) => {
    "use strict";
    
    let version_cloudfront = null;
    const params = {
        Name: 'VERSION', // replace with your parameter's name
        WithDecryption: true
    };

    try {
        const response = await ssm.getParameter(params).promise();
        version_cloudfront = response.Parameter.Value;

        try {
            await Promise.all([
                fetchPageOS(version_cloudfront),
                fetchCreds()
                // getCrossAccountCredentials()
            ]);
        } catch (e) {
            console.error('ERROR:', e);
        }
    } catch (error) {
        console.error(error);
    }

    console.log(version_cloudfront);


    // try {
    //     await Promise.all([
    //         fetchPageOS(version_cloudfront),
    //         fetchCreds()
    //         // getCrossAccountCredentials()
    //     ]);
    // } catch (e) {
    //     console.error('ERROR:', e);
    // }

    const response = {
        status: '200',
        statusDescription: 'OK',

        body: `${test4};` + `\nversion: ${version_cloudfront}`

    };
    callback(null, response);

};


const httpFetch = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', (data) => {
                body += data;
            });
            res.on('end', () => {
                resolve(body);
            });
            res.on('error', (e) => {
                reject(e);
            });
        });
    });
};

const fetchCreds = (referer) => {
    return new Promise((resolve) => {
        // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
        // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        // We rethrow the exception by default.
        client.getSecretValue({SecretId: secretName}, function(err, data) {
            if (err) {
                if (err.code === 'DecryptionFailureException')
                    // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    console.error(err);
                else if (err.code === 'InternalServiceErrorException')
                    // An error occurred on the server side.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    console.error(err);
                else if (err.code === 'InvalidParameterException')
                    // You provided an invalid value for a parameter.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    console.error(err);
                else if (err.code === 'InvalidRequestException')
                    // You provided a parameter value that is not valid for the current state of the resource.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    console.error(err);
                else if (err.code === 'ResourceNotFoundException')
                    // We can't find the resource that you asked for.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    console.error(err);
            }
            
            else {
            // Decrypts secret using the associated KMS key.
            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if ('SecretString' in data) {
                secret = data.SecretString;
            } else {
                let buff = new Buffer(data.SecretBinary, 'base64');
                decodedBinarySecret = buff.toString('ascii');
                }
            }
            
            resolve('');
        });
    });
};

const fetchPageOS = (version) => {
    return new Promise((resolve) => {
        httpFetch(`http://d3pyozpmtebsga.cloudfront.net/test4.txt`)
            .then((res) => { 
                console.log(res);
                test4 = res;
                resolve();
            })
            .catch(() => {
                console.log('failtofetch');
                test4 = '';
                resolve();
            });
    });
};




const getCrossAccountCredentials = async () => {
  return new Promise((resolve, reject) => {
    const timestamp = (new Date()).getTime();
    const params = {
      RoleArn: 'arn:aws:iam::519140963702:role/VersionLambdaTestSTS',
      RoleSessionName: `be-descriptibe-here-${timestamp}`
    };
    sts.assumeRole(params, (err, data) => {
      if (err) reject(err);
      else {
        role_access_key_id = data.Credentials.AccessKeyId;
        role_secret_access_key = data.Credentials.SecretAccessKey;
        
        resolve({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        });
      }
    });
  });
}
// toha kartoha

