import {Routes} from '@angular/router';
import {RagDocumentUpload} from './components/rag-document-upload/rag-document-upload';

export const ChatbotRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "upload",
        component: RagDocumentUpload,
      }
    ]
  }
]
