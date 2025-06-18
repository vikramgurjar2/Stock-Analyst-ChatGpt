import React from 'react';

const InvestorsSection = ({ investors = [], selectedInvestor, setSelectedInvestor }) => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Assigned Investors</h3>
          <p className="text-sm text-gray-600">Manage and review investor portfolios</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investors.length > 0 ? (
              investors.map((investor) => (
                <div 
                  key={investor.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedInvestor && setSelectedInvestor(investor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{investor.name}</h4>
                      <p className="text-sm text-gray-600">{investor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${investor.portfolio?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-gray-500">Portfolio Value</p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors">
                      View Portfolio
                    </button>
                    <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors">
                      Generate Report
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No investors assigned</p>
                <p className="text-sm mt-2">Investors will appear here once they are assigned to you</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorsSection;