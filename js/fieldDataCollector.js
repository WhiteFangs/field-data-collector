new Vue({
  el: "#main",
  data: function(){
    return {
      page: "menu",
      subpage: "menu",
      models: [],
      categories: [],
      collects: [],
      editingCategory: null,
      editingModel: null,
      newCategoryName : "",
      newModelName: "",
      newCollect: {
        model: null,
        name: ""
      },
      currentCollectIdx: null,
      currentDataIdx: null,
      lastUsedItems: {}
    };
  },
  computed: {
    currentCollect: function(){
      if(this.currentCollectIdx == null)
        return null;
      return this.collects[this.currentCollectIdx];
    },
    currentModel: function(){
      if(this.currentCollectIdx == null)
        return null;
      var modelName = this.collects[this.currentCollectIdx].model;
      var model = this.models.filter(function(m){return m.name == modelName})[0];
      return model != null ? model : {name: "_unknown_", columns: []};
    },
    currentData: function(){
      if(this.currentCollect == null || this.currentDataIdx == null)
        return null;
      return this.currentCollect.data[this.currentDataIdx];
    },
    columnItems: function(){
      if(this.currentCollect == null || !this.subpage.startsWith("newData_"))
        return [];
      var columnNumber = parseInt(this.subpage.replace("newData_", ""));
      var column = this.currentModel.columns[columnNumber];
      if(column == null)
        return [];
      var category = this.categories.filter(function(c){return c.name == column.category})[0];
      return category != null ? category.items : [];
    }
  },
  methods: {
    //collects
    startNewCollect: function(){
      var that = this;
      if(this.models.filter(function(m){return m.name == that.newCollect.model}).length == 0)
        return;
      this.collects.push({
        name: that.newCollect.name,
        model: that.newCollect.model,
        data: []
      });
      this.saveCollects();
      this.currentCollectIdx = this.collects.length - 1;
      this.page = "collect";
    },
    deleteCollectConfirm: function(collectidx){
      this.collects.splice(collectidx, 1);
      this.saveCollects();
    },
    deleteCollect: function(collect){
      Vue.set(collect, "confirmDelete", true);
    },
    editCollect: function(idx){
      this.currentCollectIdx = idx;
      this.page = "collect";
    },
    addZero: function(date){
      if(date.toString().length < 2)
        return "0" + date.toString();
      return date.toString();
    },
    getDate: function(d){
      return this.addZero(d.getDate()) + "-" + this.addZero(d.getMonth() + 1) + "-" + d.getFullYear();
    },
    newData: function(){
      var d = new Date();
      var date = this.getDate(d);
      var time = this.addZero(d.getHours()) + ":" + this.addZero(d.getMinutes()) + ":" + this.addZero(d.getSeconds());
      var newData = [date, time];
      var modelLength = this.currentModel.columns.length;
      newData = newData.concat(Array.apply(null, Array(modelLength)));
      this.currentCollect.data.push(newData);
      this.currentDataIdx = this.currentCollect.data.length - 1;
      this.subpage = "newData_0";
    },
    saveData: function(){
      var that = this;
      this.currentData.slice(2).forEach(function(d, nb){
        if(that.lastUsedItems[nb] == null)
          Vue.set(that.lastUsedItems, nb, []);
        if(that.lastUsedItems[nb].indexOf({name: d}) < 0)
          that.lastUsedItems[nb].unshift({name: d});
        if(that.lastUsedItems[nb].length > 3)
          that.lastUsedItems[nb].splice(3, 1);
      });
      this.saveCollects();
      this.subpage = 'menu';
    },
    editData: function(idx, col){
      this.currentDataIdx = idx;
      this.subpage = "newData_" + (col < 2 ? 0 : col - 2);
    },
    setItem: function(nb, item){
      this.currentData.splice(nb+2, 1, item.name);
    },
    // categories
    deleteCategoryConfirm: function(catidx){
      this.categories.splice(catidx, 1);
      this.saveCategories();
    },
    deleteCategory: function(category){
      Vue.set(category, "confirmDelete", true);
    },
    editCategory: function(catidx){
      this.editingCategory = catidx;
      this.page = "category";
    },
    addItem: function(){
      this.categories[this.editingCategory].items.push({name: "", editing: true});
    },
    removeItem: function(itemidx){
      this.categories[this.editingCategory].items.splice(itemidx, 1);
    },
    editItem: function(item){
      Vue.set(item, "editing", true);
    },
    saveItem: function(item){
      if(item.name.trim().length == 0)
        return;
      item.editing = false;
      this.saveCategories();
    },
    saveNewCategory: function(){
      this.categories.push({
        name: this.newCategoryName,
        items: []
      });
      this.saveCategories();
      this.editCategory(this.categories.length - 1);
    },
    // models
    deleteModelConfirm: function(modelidx){
      this.models.splice(modelidx, 1);
      this.saveModels();
    },
    deleteModel: function(model){
      Vue.set(model, "confirmDelete", true);
    },
    editModel: function(modelidx){
      this.editingModel = modelidx;
      this.page = "model";
    },
    addColumn: function(){
      this.models[this.editingModel].columns.push({name: "", category: null, editing: true});
    },
    removeColumn: function(colidx){
      this.models[this.editingModel].columns.splice(colidx, 1);
    },
    editColumn: function(column){
      Vue.set(column, "editing", true);
    },
    // storage
    downloadCollect: function(collect){
      var lineArray = [];
      collect.data.forEach(function (row, index) {
        var line = row.join(",");
        lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      });
      var csvContent = lineArray.join("\n");
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      var filename = "Collect_" + collect.name + "_" + this.getDate(new Date());
      link.setAttribute("download", filename + ".csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    saveNewModel: function(){
      this.models.push({
        name: this.newModelName,
        columns: []
      });
      this.saveModels();
      this.editModel(this.models.length -1);
    },
    saveCollects: function(){
      this.saveToLocalStorage("fdc_collects", this.collects);
    },
    saveCategories: function(){
      this.saveToLocalStorage("fdc_categories", this.categories);
    },
    saveModels: function(){
      this.saveToLocalStorage("fdc_models", this.models);
    },
    saveToLocalStorage: function(key, item){
      localStorage.setItem(key, JSON.stringify(item));
    },
    getFromLocalStorage: function(key){
      var item = localStorage.getItem(key);
      if(item == null)
        return [];
      return JSON.parse(item);
    }
  },
  watch: {
    "newCollect.model": function(newValue){
      if(newValue != null)
        this.newCollect.name = newValue + "_" + this.getDate(new Date());
    },
    page: function(newValue, oldValue){
      if(oldValue == "newCollect"){
        this.newCollect = {
          model: null,
          name: ""
        }
      }
      if(oldValue == "newModel"){
        this.newModelName = "";
      }
      if(oldValue == "model"){
        this.saveModels();
        this.editingModel = null;
      }
      if(oldValue == "newCategory"){
        this.newCategoryName = "";
      }
      if(oldValue == "category"){
        this.saveCategories();
        this.editingCategory = null;
      }
    }
  },
  mounted: function(){
    this.categories = this.getFromLocalStorage("fdc_categories");
    this.models = this.getFromLocalStorage("fdc_models");
    this.collects = this.getFromLocalStorage("fdc_collects");
    document.getElementById("main").style.display = "block";
  }
});

