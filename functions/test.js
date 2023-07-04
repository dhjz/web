function generateData(param) {
  const { page = 1, limit = 10, fields = 'name' } = param || {}
  const filedList = fields.split(',')
  const data = new Array(limit).fill(0).map((d, ind) => {
    let item = {}
    filedList.forEach((k) => {
      item[k] = page + '_' + limit + '_' + (ind + 1) +  '_' + Math.random().toString(36).slice(-8)
    })
    return item
  })
  return data
}


exports.handler = async function (event, context) {
  // console.log(JSON.stringify(event))
  const { httpMethod,  queryStringParameters } = event
  console.log(queryStringParameters, httpMethod)

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(generateData(queryStringParameters)),
  };
};