import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef(null);

  // if using a class, equivalent of componentDidMount 
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: 'files/PDFTRON_about.pdf',
        //pdftronServer: 'http://localhost:8090/'
      },
      viewer.current,
    ).then((instance) => {
      const { docViewer, Annotations } = instance;
      const annotManager = docViewer.getAnnotationManager();

      docViewer.on('documentLoaded', () => {
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
      annotManager.on('annotationChanged', async (annotations, action) => {
        //Java api call
        if (action === 'add') {
          console.log('this is a change that added annotations');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);
        } else if (action === 'modify') {
          console.log('this change modified annotations');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);
        } else if (action === 'delete') {
          console.log('there were annotations deleted');
          const xfdfString = await annotManager.getAnnotCommand();
          console.log(xfdfString);
        }
  
        annotations.forEach((annot) => {
          console.log('annotation page number', annot.PageNumber);
        });
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}>//render my webviewer</div>
    </div>
  );
};

export default App;
