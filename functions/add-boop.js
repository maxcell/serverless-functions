const { hasuraRequest } = require('./utils/hasura')

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed"
    }
  }

  const body = JSON.parse(event.body)

  if (!!body.corgi_id) {
    const boop = await hasuraRequest({
      query: `mutation IncrementBoop($id: String!){
        update_boops_by_pk(pk_columns: {id: $id}, _inc: {count: 1}) {
          count
          id
        }
      }
      `,
      variables: {
        id: body.corgi_id
      }
    })

    return {
      statusCode: 201,
      body: JSON.stringify(boop)
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "You must supply a valid corgi_id"
      })
    }
  }
}