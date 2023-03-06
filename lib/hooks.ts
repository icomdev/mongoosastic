// import { MongoosasticDocument } from "./types";

export async function postSave(doc: any): Promise<void> {
  if (!doc) {
    return
  }

  const options = doc.esOptions()

  const filter = options && options.filter

  function onIndex(err: unknown, res: unknown) {
    if (!filter || !filter(doc)) {
      doc.emit('es-indexed', err, res)
    } else {
      doc.emit('es-filtered', err, res)
    }
  }

  const populate = options && options.populate
  if (doc) {
    if (populate && populate.length) {
      populate.forEach((populateOpts:any) => {
        doc.populate(populateOpts)
      })

      doc.execPopulate().then((popDoc:any) => {
        popDoc
          .index()
          .then((res: any) => onIndex(null, res))
          .catch((err: any) => onIndex(err, null))
      })
    } else {
      doc
        .index()
        .then((res: any) => onIndex(null, res))
        .catch((err: any) => onIndex(err, null))
    }
  }
}

export function postRemove(doc: any): void {
  if (!doc) {
    return
  }

  doc.unIndex()
}
