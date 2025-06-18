import React from 'react';
import { Eye, Download } from 'lucide-react';

const ReportsSection = ({ reports = [] }) => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analysis Reports</h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Generate New Report
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{report.title}</h4>
                    <p className="text-sm text-gray-600">{report.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No reports available</p>
                <p className="text-sm mt-2">Generate your first report to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;