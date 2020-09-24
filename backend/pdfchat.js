const PDFDocument = require("pdfkit");

//const doc = new PDFDocument({ bufferPages: true });


async function createPDF(data, res) {
    const doc = new PDFDocument;
    doc.on("end", () => {
        
        res.end();
    });
    /*let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
            "Content-Length": Buffer.byteLength(pdfData),
            "Content-Type": "application/pdf",
            "Content-disposition": "attachment;filename=myscript.pdf",
        })
        res.end(pdfData);
    });
    // const stream = doc.pipe(blobStream());
    // doc.pipe(fs.createWriteStream("output.pdf"));
*/
    await doc.pipe(res);
    doc.fontSize(25).text("Transcript", { align: "center" });

        doc.fontSize(20).text("Problem", { align: "left" });
        doc.fontSize(15).text(data.problem, { align: "left" });
        var chat = data.chat;
        // console.log(chat);
        if (chat && chat.length > 0) {
            doc.fontSize(20).text("Conversation");
            for (const c of chat) {
                doc.fontSize(15).text(`Q. ${c[4]}`);
                doc.fontSize(15).text(`A. ${c[5]}`);
            }
        }
    doc.end();
    
}

module.exports = createPDF;