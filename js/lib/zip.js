/* ============================================================
   Tiny ZIP writer (zip.js) — STORE method (no compression).
   Zero dependencies. Produces a downloadable Blob.
   Sufficient for static-site bundles (HTML/CSS/JS/images).
   ============================================================ */

(function () {
  // CRC32 table
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function strToUtf8(str) {
    return new TextEncoder().encode(str);
  }

  // DOS time/date (fixed-ish; uses current time)
  function dosTimeDate() {
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2));
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { time: time & 0xFFFF, date: date & 0xFFFF };
  }

  function ZipWriter() {
    this.files = [];
  }

  // data: string or Uint8Array
  ZipWriter.prototype.add = function (name, data) {
    var bytes = (typeof data === "string") ? strToUtf8(data) : data;
    this.files.push({ name: name, bytes: bytes, crc: crc32(bytes) });
  };

  ZipWriter.prototype.generate = function () {
    var parts = [];           // array of Uint8Array
    var central = [];
    var offset = 0;
    var dt = dosTimeDate();

    function u16(n) { return [n & 0xFF, (n >>> 8) & 0xFF]; }
    function u32(n) { return [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]; }

    this.files.forEach(function (f) {
      var nameBytes = strToUtf8(f.name);
      var size = f.bytes.length;

      // local file header
      var local = [].concat(
        u32(0x04034b50),     // signature
        u16(20),             // version needed
        u16(0x0800),         // flags: UTF-8 filename
        u16(0),              // method: store
        u16(dt.time), u16(dt.date),
        u32(f.crc),
        u32(size),           // compressed size
        u32(size),           // uncompressed size
        u16(nameBytes.length),
        u16(0)               // extra len
      );
      var localHeader = new Uint8Array(local);
      parts.push(localHeader);
      parts.push(nameBytes);
      parts.push(f.bytes);

      // central directory record
      var cd = [].concat(
        u32(0x02014b50),
        u16(20), u16(20),
        u16(0x0800), u16(0),
        u16(dt.time), u16(dt.date),
        u32(f.crc),
        u32(size), u32(size),
        u16(nameBytes.length),
        u16(0), u16(0), u16(0), u16(0),
        u32(0),              // external attrs
        u32(offset)          // local header offset
      );
      central.push({ header: new Uint8Array(cd), name: nameBytes });

      offset += localHeader.length + nameBytes.length + f.bytes.length;
    });

    var cdStart = offset;
    var cdSize = 0;
    central.forEach(function (c) {
      parts.push(c.header);
      parts.push(c.name);
      cdSize += c.header.length + c.name.length;
    });

    // end of central directory
    var eocd = [].concat(
      u32(0x06054b50),
      u16(0), u16(0),
      u16(this.files.length), u16(this.files.length),
      u32(cdSize), u32(cdStart),
      u16(0)
    );
    parts.push(new Uint8Array(eocd));

    return new Blob(parts, { type: "application/zip" });
  };

  window.GF_Zip = { Writer: ZipWriter, crc32: crc32 };
})();
