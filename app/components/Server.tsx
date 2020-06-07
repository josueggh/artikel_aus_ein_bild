const URL = "http://192.168.86.34:8080";

async function translate(imageURI: string) {
  const formData = new FormData();
  formData.append("data", {
    uri: imageURI,
    name: "photo",
    type: "image/jpg",
  });

  return await fetch(URL + "/translate", {
    method: "POST",
    body: formData,
  }).then(  async response => {
    return response.json();
  })
}

export default {
  translate,
};