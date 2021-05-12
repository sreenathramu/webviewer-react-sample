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
        initialDoc: 'files/annotation_myapp_test6.pdf',
        documentXFDFRetriever: async () => {
          const rows = await loadXfdfStrings();
          return rows;
        },
        //pdftronServer: 'http://localhost:8090/'
      },
      viewer.current,
    ).then((instance) => {
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
      ]);


      // Adding Custom Stamps
      const customStamps = [
        { title: "Approved", subtitle: "[By $currentUser at] h:mm:ss a, MMMM D, YYYY" },
        { title: "Reviewed", subtitle: "[By $currentUser at] h:mm:ss a, MMMM D, YYYY", color: new Annotations.Color('#D65656') },
      ]
      tool.setCustomStamps(customStamps);
      console.log(tool.getStandardStamps());

      // Event listener for document on load
      docViewer.on('documentLoaded', () => {
        const doc = docViewer.getDocument();
        doc.getLayersArray().then(layers => {
          // Set all layers to not visible
          layers.forEach((layer, index) => {
            layers[index].visible = true;
          });
      //let xfdf = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<xfdf xmlns=\"http://ns.adobe.com/xfdf/\" xml:space=\"preserve\">\n<fields />\n<add><freetext page=\"0\" rect=\"149.969,205.75,284.1,784.49\" color=\"#FFFFFF\" flags=\"print\" name=\"9afbca66-4877-16d9-7d74-6b9c1a09a587\" title=\"Guest\" subject=\"Callout\" rotation=\"90\" date=\"D:20210511131832+05\'30\'\" creationdate=\"D:20210511131829+05\'30\'\" fringe=\"0.5,428.24,103.63100000000003,0.5\" TextColor=\"#FF0000\" FontSize=\"12\" IT=\"FreeTextCallout\" callout=\"283.6,206.25,186.91,534.96,180.47,708.99\" head=\"OpenArrow\"><trn-custom-data bytes=\"{&quot;trn-wrapped-text-lines&quot;:&quot;[\\&quot;Insert text here \\&quot;]&quot;}\"/><contents>Insert text here</contents><defaultappearance>0.612 0.612 0.612 rg /Helvetica 12 Tf</defaultappearance><defaultstyle>font: Helvetica 12pt; text-align: left; color: #FF0000</defaultstyle></freetext></add>\n<modify />\n<delete />\n</xfdf>";
          //annotManager.importAnnotations(xfdf);
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
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
