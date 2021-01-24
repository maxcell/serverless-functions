exports.handler = async (event, context) => {
  if (event.body) {
    let name = JSON.parse(event.body)['name'] || 'World'

    return {
      statusCode: 200,
      body: `Hello, ${name}!`
    }
  } else {
    return {
      statusCode: 400,
      code: 'You must make sure to send a JSON object with a "name" key'
    }
  }
}