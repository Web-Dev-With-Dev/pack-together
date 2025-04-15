  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="space-y-2">
            <h3 className="font-medium text-lg">{category}</h3>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.packed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  } hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.packed}
                      onCheckedChange={() => handleToggleItem(item.id)}
                    />
                    <span className={item.packed ? "line-through text-gray-500" : ""}>
                      {item.name}
                      {item.isMandatory && item.isTransportRequired && (
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Required for {currentTrip?.transportation}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.assignedTo && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
                        <User className="h-3 w-3" />
                        <span className="text-sm">
                          {people.find((p) => p.id === item.assignedTo)?.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.isMandatory && item.isTransportRequired
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700 hover:bg-red-50"
                      }`}
                      disabled={item.isMandatory && item.isTransportRequired}
                      title={
                        item.isMandatory && item.isTransportRequired
                          ? "This item is required for your transportation mode"
                          : "Delete item"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ); 