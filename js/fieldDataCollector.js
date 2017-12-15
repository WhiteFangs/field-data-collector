new Vue({
  el: "#main",
  data: function(){
    return {
      page: "menu",
      subpage: -1,
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
    };
  },
  computed: {
    currentCollect: function(){
      if(this.currentCollectIdx == null)
        return null;
      return this.collects[this.currentCollectIdx];
    },
    currentData: function(){
      if(this.currentCollect == null)
        return null;
      return this.currentCollect.data[this.currentCollect.data.length - 1];
    },
    columnItems: function(){
      if(this.currentCollect == null || this.subpage < 0)
        return [];
      var column = this.currentCollect.model.columns[this.subpage];
      var category = this.categories.filter(function(c){return c.name == column.category})[0];
      return category != null ? category.items : [];
    }
  },
  methods: {
    //collects
    startNewCollect: function(){
      var that = this;
      var model = this.models.filter(function(m){return m.name == that.newCollect.model})[0];
      if(model == null)
        return;
      this.collects.push({
        name: that.newCollect.name,
        model: model,
        data: []
      });
      this.currentCollectIdx = this.collects.length - 1;
      this.page = "collect";
    },
    addZero: function(date){
      if(date.toString().length < 2)
        return "0" + date.toString();
      return date.toString();
    },
    newData: function(){
      var d = new Date();
      var date = this.addZero(d.getDate()) + "-" + this.addZero(d.getMonth() + 1) + "-" + d.getFullYear();
      var time = this.addZero(d.getHours()) + ":" + this.addZero(d.getMinutes()) + ":" + this.addZero(d.getSeconds());
      var newData = [date, time];
      var modelLength = this.currentCollect.model.columns.length;
      newData = newData.concat(Array.apply(null, Array(modelLength)));
      this.currentCollect.data.push(newData);
      this.subpage = 0;
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
    saveNewModel: function(){
      this.models.push({
        name: this.newModelName,
        columns: []
      });
      this.saveModels();
      this.editModel(this.models.length -1);
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
    document.getElementById("main").style.display = "block";
  }
});

