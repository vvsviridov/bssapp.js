//   const param = {
//      "qRxLevMin": "-69",
//      "a2CriticalThresholdRsrp": "-70"
//   }


function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}


function plusClicked() {
  const rows = document.getElementsByClassName("param-row")
  const lastRow = rows[rows.length - 1]
  const newRow = lastRow.cloneNode(true)
  insertAfter(newRow, lastRow)
}


function uploadFile() {
  const input = document.getElementById('filename')
  const file = input.files[0]
  const reader = new FileReader()

  reader.readAsText(file)

  return reader
}


function domToString(dom) {
  if (typeof window.XMLSerializer == "undefined") {
    throw new Error("No modern XML serializer found.")
  }
  const s = new XMLSerializer()
  return s.serializeToString(dom)
}


function downloadFile(xmlContent) {
  const input = document.getElementById('filename')
  filename = `modified_${input.files[0].name}`
  const file = new File([xmlContent], filename, {
    type: "text/xml",
  })

  const link = document.createElement('a')
  link.download = file.name

  link.href = URL.createObjectURL(file)
  link.click()
  URL.revokeObjectURL(link.href)
}


function evaluateXPath(aNode, aExpr) {
  const xpe = new XPathEvaluator()
  const nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?
    aNode.documentElement : aNode.ownerDocument.documentElement)
  const result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null)
  const found = []
  let res
  while (res = result.iterateNext())
    found.push(res)
  return found
}


function xmlHandler(reader) {
  const xmlStr = reader.result
  const parser = new DOMParser()
  const dom = parser.parseFromString(xmlStr, "application/xml")
  const keys = Array.from(document.getElementsByClassName("pKey")).map(elem => {
    return elem.value
  })
  const values = Array.from(document.getElementsByClassName("pValue")).map(elem => {
    return elem.value
  })
  keys.forEach((key, index) => {
    const elements = evaluateXPath(dom, `//es:${key}`)
    M.toast({ html: `${key}: ${elements.length}`, classes: 'rounded' })
    elements.forEach(elem => {
      if (values[index] != "") {
        elem.textContent = values[index]
      }
      const lastAncestor = evaluateXPath(elem, "ancestor::xn:VsDataContainer")[0]
      lastAncestor.setAttribute("modifier", "update")
    })
  })

  return domToString(dom)
}


function fileHandling() {
  reader = uploadFile()

  reader.onload = () => {
    const xmlString = xmlHandler(reader)
    downloadFile(xmlString)
    M.toast({ html: 'Success!', classes: 'rounded green' })
  }
  reader.onloadstart = () => {
    M.toast({ html: 'Load starting!', classes: 'rounded' })
  }
  reader.onloadend = () => {
    M.toast({ html: 'Load ended!', classes: 'rounded' })
  }
  reader.onerror = () => {
    M.toast({ html: 'Error!', classes: 'rounded red' })
    console.log(reader.error)
  }
}