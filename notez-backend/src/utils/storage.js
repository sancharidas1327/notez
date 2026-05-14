const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const path = require("path");

const bucketName = process.env.GRIDFS_BUCKET || "noteUploads";

const isGridFS = () => process.env.STORAGE_DRIVER === "gridfs";

const makeStoredFilename = (originalname = "note") =>
  `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(originalname)}`;

const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected");
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName });
};

const saveUploadedFile = async (file) => {
  if (!file) throw new Error("No file uploaded");

  if (!isGridFS()) {
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
    };
  }

  const filename = makeStoredFilename(file.originalname);
  const bucket = getBucket();

  await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalname: file.originalname,
        size: file.size,
      },
    });

    stream.on("error", reject);
    stream.on("finish", resolve);
    stream.end(file.buffer);
  });

  return {
    filename,
    url: `/uploads/${filename}`,
    size: file.size,
  };
};

const streamUploadedFile = async (req, res) => {
  if (!isGridFS()) {
    return res.status(404).json({ message: "File storage route is not enabled" });
  }

  const bucket = getBucket();
  const files = await bucket.find({ filename: req.params.filename }).limit(1).toArray();
  if (!files.length) return res.status(404).json({ message: "File not found" });

  const file = files[0];
  if (file.contentType) res.set("Content-Type", file.contentType);
  res.set("Cache-Control", "public, max-age=604800");

  bucket.openDownloadStreamByName(req.params.filename).pipe(res);
};

module.exports = {
  isGridFS,
  saveUploadedFile,
  streamUploadedFile,
};
