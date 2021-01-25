const fetch = require("node-fetch")
const { hasuraRequest } = require('./utils/hasura')

exports.handler = async () => {

  const corgis = await fetch("http://no-cors-api.netlify.app/api/corgis").then(res => res.json())

  // Set up a promise for retrieving our unsplash photos
  const unsplashPromise = fetch('https://api.unsplash.com/collections/48405776/photos', {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
    }
  }).then(res => res.json())

  const hasuraPromise = hasuraRequest({
    query: `
    mutation InsertOrUpdateBoops($corgis: [boops_insert_input!]!) {
      boops: insert_boops(objects: $corgis, on_conflict: {constraint: boops_pkey, update_columns: id}) {
        returning {
          count
          id
        }
      }
    }
    `,
    variables: {
      corgis: corgis.map(({ id }) => ({ id, count: 0 }))
    }
  })

  // Call for unsplash and hasura in parallel so we can retrieve
  // all of our data without clogging up and waiting
  const [unsplashPhotos, hasuraData] = await Promise.all([
    unsplashPromise,
    hasuraPromise
  ])

  const completeData = corgis.map(corgi => {

    const corgiPhoto = unsplashPhotos.find(p => p.id === corgi.id)
    const boops = hasuraData.boops.returning.find(boop => boop.id === corgi.id)

    return {
      ...corgi,
      alt: corgiPhoto.alt_description,
      credit: corgiPhoto.user.name,
      url: `${corgiPhoto.urls.raw}&auto=format&fit=crop&w=300&h=300&q=80&crop=entropy`,
      boops: boops.count
    }
  })


  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(completeData)
  }
}