const fetch = require("node-fetch")

exports.handler = async () => {

  const corgis = await fetch("http://no-cors-api.netlify.app/api/corgis").then(res => res.json())

  // Set up a promise for retrieving our unsplash photos
  const unsplashPromise = fetch('https://api.unsplash.com/collections/48405776/photos', {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
    }
  }).then(res => res.json())

  // Call for unsplash and hasura in parallel so we can retrieve
  // all of our data without clogging up and waiting
  const [unsplashPhotos] = await Promise.all([
    unsplashPromise
  ])

  const completeData = corgis.map(corgi => {

    const corgiPhoto = unsplashPhotos.find(p => p.id === corgi.id)

    return {
      ...corgi,
      alt: corgiPhoto.alt_description,
      credit: corgiPhoto.user.name,
      url: `${corgiPhoto.urls.raw}&auto=format&fit=crop&w=300&h=300&q=80&crop=entropy`
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