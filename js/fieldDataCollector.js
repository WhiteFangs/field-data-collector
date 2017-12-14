new Vue({
  el: "#main",
  data: function(){
    return {
      page: "menu",
      models: [],
      categories: [],
      editingCategory: null,
      newCategoryName : "",
      newModel: {
        name: "",
        columns: []
      },
    };
  },
  methods: {
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
    deleteModelConfirm: function(model){
      var idx = this.models.indexOf(model);
      this.models.splice(idx, 1);
      this.saveModels();
    },
    deleteModel: function(model){
      Vue.set(model, "confirmDelete", true);
    },
    addNewColumn: function(){
      this.newModel.columns.push({name : "NewColumn", category : "Empty"});
      Vue.set(this.newModel.columns[this.newModel.columns.length - 1], "editing", true);
    },
    saveNewModel: function(){
      this.models.push(this.newModel);
      this.saveModels();
      this.page = "models";
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
      if(oldValue == "newModel"){
        this.newModel = {
          name: "",
          columns: []
        };
      }
      if(oldValue == "newCategory"){
        this.newCategoryName = "";
      }
      if(oldValue == "category"){
        this.saveCategories();
      }
    }
  },
  mounted: function(){
    this.categories = this.getFromLocalStorage("fdc_categories");
    this.models = this.getFromLocalStorage("fdc_models");
    document.getElementById("main").style.display = "block";
  }
});

