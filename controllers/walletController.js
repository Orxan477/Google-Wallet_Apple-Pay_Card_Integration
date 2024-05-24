const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class WalletController {
  constructor() {
    this.keyFilePath = '../key.json';
    this.auth();
  }

  auth() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.keyFilePath,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    this.credentials = require(this.keyFilePath);

    this.client = google.walletobjects({
      version: 'v1',
      auth: auth,
    });
  }

  async createClass(req, res) {
    const { issuerId, classSuffix } = req.body;
    let response;

    try {
      response = await this.client.loyaltyclass.get({
        resourceId: `${issuerId}.${classSuffix}`
      });

      console.log(`Class ${issuerId}.${classSuffix} already exists!`);
      return res.status(200).send(`Class ${issuerId}.${classSuffix} already exists!`);
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        console.log(err);
        return res.status(500).send(err.message);
      }
    }

    let newClass = {
      'id': `${issuerId}.${classSuffix}`,
      'issuerName': 'Buta Grup',
      'reviewStatus': 'UNDER_REVIEW',
      'programName': 'XXXXXX XXX',
      'programLogo': {
        'sourceUri': {
          'uri': 'https://media.licdn.com/dms/image/D4E0BAQFSSPgW7bqzPg/company-logo_200_200/0/1681301108918/butagrupaz_logo?e=2147483647&v=beta&t=gDwJm9VNyvRmMdpusl6eizoMa1cz920dQvfoeZFwBhI'
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': 'Logo description'
          }
        }
      }
    };

    try {
      response = await this.client.loyaltyclass.insert({ requestBody: newClass });
      console.log('Class insert response:', response);
      res.status(201).send(`Class ${issuerId}.${classSuffix} created successfully.`);
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  }

  createJwtNewObjects(req, res) {
    // const response = {
    //     status: 'success',
    //     message: 'Received name successfully',
    //     data: {
    //         name: req.body.name
    //     }
    // };

    // // JSON formatında yanıtı istemciye gönderme
    // res.json(response);
    // return;
    const { issuerId, classSuffix, objectSuffix } = req.body;

    let newClass = {
      'id': `${issuerId}.${classSuffix}`,
      'issuerName': 'Buta Grup',
      'reviewStatus': 'UNDER_REVIEW',
      'programName': 'XXXX XXXXXXXX',
      'programLogo': {
        'sourceUri': {
          'uri': 'http://farm8.staticflickr.com/7340/11177041185_a61a7f2139_o.jpg'
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': 'Logo description'
          }
        }
      }
    };

    let newObject = {
      'id': `${issuerId}.${objectSuffix}`,
      'classId': `${issuerId}.${classSuffix}`,
      'state': 'ACTIVE',
      'heroImage': {
        'sourceUri': {
          'uri': 'https://butagrup.com.tr/ButaLogo3%20(4).png'
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': 'Hero image description'
          }
        }
      },
      'linksModuleData': {
        'uris': [
          {
            'uri': 'tel:+994514030477',
            'description': 'Mobil nömrə',
            'id': 'LINK_MODULE_TEL_ID'
          }
        ]
      },
      'imageModulesData': [
        {
          'mainImage': {
            'sourceUri': {
              'uri': 'https://odoo.butagrup.com.tr/assets/images/FooterLogoBlue.png'
            },
            'contentDescription': {
              'defaultValue': {
                'language': 'en-US',
                'value': 'Image module description'
              }
            }
          },
          'id': 'IMAGE_MODULE_ID'
        }
      ],
      'barcode': {
        'type': 'QR_CODE',
        'value': 'https://butagrup.com.tr'
      },
      'locations': [
        {
          'latitude': 37.424015499999996,
          'longitude': -122.09259560000001
        }
      ],
      'accountId': 'BTXXXXXX',
      'accountName': 'Buta Grup',
      'loyaltyPoints': {
        'label': 'ID',
        'balance': {
          'string': 'BTXXXX'
        }
      }
    };

    let claims = {
      iss: this.credentials.client_email,
      aud: 'google',
      origins: ['www.example.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyClasses: [newClass],
        loyaltyObjects: [newObject]
      }
    };

    let token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });

    console.log('Add to Google Wallet link');
    console.log(`https://pay.google.com/gp/v/save/${token}`);

    res.status(200).send(`https://pay.google.com/gp/v/save/${token}`);
  }

  async batchCreateObjects(req, res) {
    const { issuerId, classSuffix } = req.body;
    let data = '';
    let batchObject;
    let objectSuffix;

    for (let i = 0; i < 3; i++) {
      objectSuffix = uuidv4().replace('[^\w.-]', '_');

      batchObject = {
        'id': `${issuerId}.${objectSuffix}`,
        'classId': `${issuerId}.${classSuffix}`,
        'state': 'ACTIVE',
        'heroImage': {
          'sourceUri': {
            'uri': 'https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg'
          },
          'contentDescription': {
            'defaultValue': {
              'language': 'en-US',
              'value': 'Hero image description'
            }
          }
        },
        'textModulesData': [
          {
            'header': 'Text module header',
            'body': 'Text module body',
            'id': 'TEXT_MODULE_ID'
          }
        ],
        'linksModuleData': {
          'uris': [
            {
              'uri': 'http://maps.google.com/',
              'description': 'Link module URI description',
              'id': 'LINK_MODULE_URI_ID'
            },
            {
              'uri': 'tel:6505555555',
              'description': 'Link module tel description',
              'id': 'LINK_MODULE_TEL_ID'
            }
          ]
        },
        'imageModulesData': [
          {
            'mainImage': {
              'sourceUri': {
                'uri': 'http://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg'
              },
              'contentDescription': {
                'defaultValue': {
                  'language': 'en-US',
                  'value': 'Image module description'
                }
              }
            },
            'id': 'IMAGE_MODULE_ID'
          }
        ],
        'barcode': {
          'type': 'QR_CODE',
          'value': 'QR code'
        },
        'locations': [
          {
            'latitude': 37.424015499999996,
            'longitude': -122.09259560000001
          }
        ],
        'accountId': 'Account id',
        'accountName': 'Account name',
        'loyaltyPoints': {
          'label': 'ID',
          'balance': {
            'int': 800
          }
        }
      };

      data += '--batch_createobjectbatch\n';
      data += 'Content-Type: application/json\n\n';
      data += 'POST /walletobjects/v1/loyaltyObject\n\n';

      data += JSON.stringify(batchObject) + '\n\n';
    }
    data += '--batch_createobjectbatch--';

    try {
      let response = await this.client.context._options.auth.request({
        url: 'https://walletobjects.googleapis.com/batch',
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'multipart/mixed; boundary=batch_createobjectbatch'
        }
      });

      console.log('Batch insert response');
      console.log(response);

      res.status(200).send('Batch objects created successfully');
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  }
}

module.exports = new WalletController();
