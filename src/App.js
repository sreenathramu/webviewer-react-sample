import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const [instance, setInstance] = useState({});
  // if using a class, equivalent of componentDidMount 
  
  useEffect(() => {
    WebViewer(
      {
        fullAPI: true,
        path: '/webviewer/lib',
        initialDoc: 'files/sample5.pdf',
        documentXFDFRetriever: async () => {
          const rows = await loadXfdfStrings();
          //const data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><xfdf xmlns=\"http://ns.adobe.com/xfdf/\" xml:space=\"preserve\"><add><freetext FontSize=\"30\" IT=\"FreeTextCallout\" TextColor=\"#0000FF\" callout=\"121.75,719.29,205.05,466.17999999999995,503.02,639.19\" creationdate=\"D:20210531203921+05'30'\" date=\"D:20210531203922+05'30'\" flags=\"print\" fringe=\"382.27099999999996,159.0100000000001,1,66.09999999999991\" head=\"OpenArrow\" name=\"6d40362f-2878-a60e-43a3-4bd14e50b857\" opacity=\"0.3851433801098231\" page=\"0\" rect=\"120.75,465.17999999999995,654.021,720.29\" subject=\"Callout\" title=\"Guest\" width=\"2\"><trn-custom-data bytes=\"{&quot;trn-wrapped-text-lines&quot;:&quot;[\\&quot;Insert text \\&quot;,\\&quot;here \\&quot;]&quot;}\"/><contents>Insert text here</contents><defaultappearance>0 0 1 rg /Helvetica 30 Tf</defaultappearance><defaultstyle>font: Helvetica 30pt; text-align: left; color: #0000FF</defaultstyle></freetext><freetext FontSize=\"30\" IT=\"FreeTextCallout\" TextColor=\"#0000FF\" callout=\"156.99,645.6,189.03,440.54999999999995,749.72,684.05\" creationdate=\"D:20210531195935+05'30'\" date=\"D:20210531195935+05'30'\" flags=\"print\" fringe=\"593.731,229.5,1,1\" head=\"OpenArrow\" name=\"fe590d9a-c33b-aab8-e826-4c2d029bf4cf\" opacity=\"0.3851433801098231\" page=\"0\" rect=\"155.99,439.54999999999995,900.721,700.05\" subject=\"Callout\" title=\"Guest\" width=\"2\"><trn-custom-data bytes=\"{&quot;trn-wrapped-text-lines&quot;:&quot;[\\&quot;Insert text \\&quot;,\\&quot;here \\&quot;]&quot;}\"/><contents>Insert text here</contents><defaultappearance>0 0 1 rg /Helvetica 30 Tf</defaultappearance><defaultstyle>font: Helvetica 30pt; text-align: left; color: #0000FF</defaultstyle></freetext><freetext FontSize=\"30\" IT=\"FreeTextCallout\" TextColor=\"#0000FF\" callout=\"115.34,664.83,160.2,543.08,749.72,828.23\" creationdate=\"D:20210531201800+05'30'\" date=\"D:20210531201801+05'30'\" flags=\"print\" fringe=\"635.381,271.15,1,1\" head=\"OpenArrow\" name=\"8284758d-8aef-25eb-ad2e-59b6e787f94e\" opacity=\"0.3851433801098231\" page=\"0\" rect=\"114.34,542.08,900.721,844.23\" subject=\"Callout\" title=\"Guest\" width=\"2\"><trn-custom-data bytes=\"{&quot;trn-wrapped-text-lines&quot;:&quot;[\\&quot;Insert text \\&quot;,\\&quot;here \\&quot;]&quot;}\"/><contents>Insert text here</contents><defaultappearance>0 0 1 rg /Helvetica 30 Tf</defaultappearance><defaultstyle>font: Helvetica 30pt; text-align: left; color: #0000FF</defaultstyle></freetext></add><modify><freetext FontSize=\"30\" IT=\"FreeTextCallout\" TextColor=\"#0000FF\" callout=\"86.51,619.97,147.38,379.67999999999995,285.15,655.21\" creationdate=\"D:20210531185302+05'30'\" date=\"D:20210531185309+05'30'\" flags=\"print\" fringe=\"199.64999999999998,261.5300000000001,1,1\" head=\"OpenArrow\" name=\"6fd4133e-e656-8e33-8df1-b2adbf2ca89a\" opacity=\"0.3851433801098231\" page=\"0\" rect=\"85.51,378.67999999999995,436.15999999999997,671.21\" subject=\"Callout\" title=\"Guest\" width=\"2\"><contents>test</contents><contents-richtext><body xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:xfa=\"http://www.xfa.org/schema/xfa-data/1.0/\" xfa:apiversion=\"PDFTron\" xfa:contenttype=\"text/html\" xfa:spec=\"2.0.2\"><p><span style=\"color:#0000ff\">test</span><span/></p></body></contents-richtext><defaultappearance>0 0 1 rg /Helvetica 30 Tf</defaultappearance><defaultstyle>font: Helvetica 30pt; text-align: left; color: #0000FF</defaultstyle><apref-replace xmlns=\"http://www.w3.org/1999/xhtml\"/></freetext></modify><delete/></xfdf>";
          return rows;
        },
        //pdftronServer: 'http://localhost:8090/'
      },
      viewer.current,
    ).then((instance) => {
      var FitMode = instance.FitMode;
      instance.setFitMode(FitMode.FitWidth);
      const inst = instance;
      const { docViewer, Annotations, Tools}  = inst;
      const annotManager = docViewer.getAnnotationManager();
      const PDFNet = instance.PDFNet;
      setInstance(inst);

      // Adding Standard Stamps
      const tool = docViewer.getTool('AnnotationCreateRubberStamp');
      const standardStamps = tool.getStandardStamps();
      tool.setStandardStamps([
        ...standardStamps,
        'http://localhost:3000/files/stamp.jpg',
        'http://localhost:3000/files/Stamp-Approved.png',
      ]);


      var customVariable = "test";
      
      // Adding Custom Stamps
      const customStamps = [
        { title: "Approved", subtitle: `[By $currentUser at] h:mm:ss a, MMMM D, YYYY` },
        { title: "Reviewed", subtitle: `[By $currentUser ${customVariable} at] \r h:mm:ss a, MMMM D, YYYY`, textColor: new Annotations.Color(255,0, 0, 1.0) },
      ]
      tool.setCustomStamps(customStamps);
      console.log(tool.getCustomStampAnnotations());
      
      tool.setCustomDrawFunction((ctx, annotation) => {
        const { Icon } = annotation;
        // `Icon` contains the text content of the stamp
        // This example conditionally renders custom content on the stamp only
        // if the contents of the stamp are in the approved list of stamps to
        // draw on
        const stampsToDrawOn = [
          'Approved',
          'Completed',
          'Final',
          'Draft'
        ];
        if (stampsToDrawOn.includes(Icon)) {
          // Arbitrary example where an image is available in the DOM
          const img = document.getElementById('my-company-logo');
          ctx.drawImage(
            img, // The image to render
            0, // The X coordinate of where to place the image
            0, // The Y coordinate of where the place the image
            25, // The width of the image in pixels
            25, // The height of the image in pixels
          );
          ctx.fillStyle='#FFF';
          ctx.fillRect(0, 0, annotation.Width, annotation.Height);
          ctx.beginPath();
          ctx.lineWidth = "6";
          ctx.strokeStyle = "red";
          ctx.rect(5, 5, annotation.Width - 10, annotation.Height - 10);  
          ctx.stroke();
          ctx.fillStyle = "red";
          //ctx.textBaseline = 'bottom';
          ctx.textAlign = "center";
          ctx.font = "12px 'Calibri'";
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();

          today = mm + '/' + dd + '/' + yyyy;
          var text = `APPROVED by SAFEBuilt;\n 2018 International Codes\n Subject to inspection and compliance to all\n Relevant, adopted building and municipal codes\n ${today}`;
          var a = annotation.Width / 2;
          var b = 30;
          var lineheight = 15;
          var lines = text.split('\n');

          for (var j = 0; j<lines.length; j++) {
            ctx.fillText(lines[j], a, b + (j*lineheight) );
          }

          

          // wrapText(ctx, text, ctx.width - 1000, 60, 1000, 24);
        }
      });
      tool.drawCustomStamp({width: 500, height: 500, color: '#ffffff'});
      function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }


      // Event listener for document on load
      docViewer.on('documentLoaded', () => {
        const doc = docViewer.getDocument();
        doc.getLayersArray().then(layers => {
          // Set all layers to not visible
          layers.forEach((layer, index) => {
            layers[index].visible = true;
          });

          doc.setLayersArray(layers);
          // clears page cache
          docViewer.refreshAll();
          // redraws
          docViewer.updateView();
        });

        const rectangleAnnot = new Annotations.RectangleAnnotation();
        rectangleAnnot.PageNumber = 1;
        // values are in page coordinates with (0, 0) in the top left
        rectangleAnnot.X = 100;
        rectangleAnnot.Y = 150;
        rectangleAnnot.Width = 200;
        rectangleAnnot.Height = 50;
        rectangleAnnot.Author = annotManager.getCurrentUser();
      });

      annotManager.on("annotationSelected", (annotations, action) => {
        if (action === "selected") {
          console.log(annotations[0].Id);
          console.log(annotations);
          // setAnnotationId(annotations[0].Id);
        } else if (action === "deselected") {
          // setAnnotationId(null);
        }
      });
      // Event listener logic on change of annotation
      annotManager.on('annotationChanged', async (annotations, action, {imported}) => {

        if(imported)
          return true;

        if (action === 'add') {
          console.log('this is a change that added annotations');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);   
        } else if (action === 'modify') {
          console.log('this change modified annotations');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);
          docViewer.zoomTo(1.0, 942, 100);
        } else if (action === 'delete') {
          console.log('there were annotations deleted');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);
        }
  
        // annotations.forEach((annot) => {
        //   console.log('annotation page number', annot.PageNumber);
        // });
      });

      // annotManager.exportAnnotations().then((xfdfData) => {
      //   console.log(xfdfData);
      // });
       
      /**
       * Method to find and replace the text
       */
      docViewer.on("dblClick", async () => {
        const searchText = 'master';
        const replaceText = 'BRIDGEi2i';
        const doc = await docViewer.getDocument();
        const pdfDoc = await doc.getPDFDoc();
    
        // Run PDFNet methods with memory management
        await PDFNet.runWithCleanup(async () => {
    
          // lock the document before a write operation
          // runWithCleanup will auto unlock when complete
          pdfDoc.lock();
          const replacer = await PDFNet.ContentReplacer.create();
          await replacer.setMatchStrings(searchText.charAt(0),searchText.slice(-1));
          await replacer.addString(searchText.slice(1,-1), replaceText);
          for(var i=1; i<=docViewer.getPageCount(); ++i) {
            const page = await pdfDoc.getPage(i);
            await replacer.process(page);
          }

          const page = await pdfDoc.getPage(1);
          const target_region = await page.getMediaBox();
          const img = await PDFNet.Image.createFromURL(pdfDoc, "files/airplane.png");
          await replacer.addImage(target_region, await img.getSDFObj());
        });
        
        docViewer.refreshAll();
        docViewer.updateView();
        docViewer.getDocument().refreshTextData();
      });
    })
  }, []);

  const loadXfdfStrings = (documentId) => {
    return new Promise((resolve, reject) => {
      fetch(`/files/XFDF/calloutAnnot.xml`, {
        method: 'GET',
      }).then((res) => {
        if (res.status < 400) {
          res.text().then(xfdfStrings => {
            resolve(xfdfStrings);
          });
        } else {
          reject(res);
        }
      });
    });
  };
  

  const getMouseLocation = (e) => {
    const { docViewer, Annotations } = instance;
    const scrollElement = docViewer.getScrollViewElement();
    const scrollLeft = scrollElement.scrollLeft || 0;
    const scrollTop = scrollElement.scrollTop || 0;
  
    return {
      x: e.pageX + scrollLeft,
      y: e.pageY + scrollTop
    };
  }

  return (
    <div className="App">
      <img src="assets/tick.jpg" id="my-company-logo" height="50" width="50"/>
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
