<template>
  <div class="container">
    <div class="header">
      <i class="btn el-icon-plus new" @click="checkItem"></i>
      <el-autocomplete
        ref="input"
        class="inline-input"
        v-model="searchItem"
        :fetch-suggestions="querySearch"
        placeholder="Chercher"
        :trigger-on-focus="false"
        @select="addItem"
        @keyup.enter.native="checkItem"
      ></el-autocomplete>
      <i class="btn el-icon-close delete" @click="removeDoneItems"></i>
    </div>
    <ul class="list">
      <li
        v-for="(item, index) in list"
        :class="{ isDone: !item.status }"
        :key="item.id"
        @click="changeStatus(item)"
      >
        <span
          ><div v-if="item.status" class="empty-circle"></div>
          <i v-else class="el-icon-check btn status"></i>
        </span>
        <span class="name"> {{ item.product.name }}</span>
        <i
          class="btn el-icon-remove-outline delete"
          @click.stop="removeItem(item, index)"
        ></i>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return { searchItem: "" };
  },
  async asyncData({ app, params, store }) {
    const list = await app.$db
      .from("list")
      .select("id, status, inserted_at, product:products(name, id)")
      .order("status", { ascending: false })
      .order("inserted_at", { ascending: false })
      .then(res => {
        return res.data;
      });
    const products = await app.$db
      .from("products")
      .select("id, name")
      .order("name", { ascending: true })
      .then(res => {
        return res.data;
      });
    return { list, products };
  },
  methods: {
    querySearch(queryString, cb) {
      var list = this.products;
      var results = queryString
        ? list.filter(this.createFilter(queryString))
        : list;

      results.forEach(function(item) {
        item.value = item.name;
      });

      cb(results);
    },
    createFilter(queryString) {
      return item => {
        return item.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    async addItem(item) {
      //Fake entry to be fast
      this.list.unshift({ status: 1, product: item });
      const { data, error } = await this.$db
        .from("list")
        .insert([{ product: item.id, status: 1 }]);

      this.reload();
    },
    async changeStatus(item) {
      //Fake entry to be fast
      item.status = item.status ? 0 : 1;

      const { data, error } = await this.$db
        .from("list")
        .update({ status: item.status })
        .eq("id", item.id);
      this.reload();
    },
    async removeItem(item, index) {
      //Fake entry to be fast
      this.list.splice(index, 1);

      const { data, error } = await this.$db
        .from("list")
        .delete()
        .eq("id", item.id);
      this.reload();
    },
    checkItem() {
      let item = this.products.find(
        e => e.name === this.searchItem.toLowerCase()
      );
      if (item) {
        this.addItem(item);
      } else {
        this.createItem(this.searchItem);
      }
    },
    async createItem(name) {
      //Fake entry to be fast
      const { data, error } = await this.$db
        .from("products")
        .insert([{ name: name.toLowerCase() }]);
      if (data) {
        this.addItem(data[0]);
      }
    },
    removeDoneItems() {
      this.$confirm("Tous les achats complétés seront supprimés. Continuer?", {
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        type: "warning"
      }).then(() => {
        this.doRemoveDoneItems();
      });
    },
    async doRemoveDoneItems() {
      //Fake entry to be fast
      this.list = this.list.filter(item => item.status == 1);
      const { data, error } = await this.$db
        .from("list")
        .delete()
        .eq("status", 0);
      this.reload();
    },
    reload() {
      this.searchItem = "";
      this.$nuxt.refresh();
    }
  }
};
</script>

<style>
body,
input {
  font-size: 24px !important;
}
body {
  font-family: "Balsamiq Sans", cursive;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-color: #edfaff;
}

.container,
.header {
  width: 100%;
}
.header i.btn {
  color: #fff;
}
.header .new {
  margin-right: 10px;
}
.header .delete {
  padding-left: 10px;
  margin-left: auto;
}
i.btn {
  font-weight: bolder !important;
  margin: 1px 0 0 0;
}
.header {
  display: flex;
  align-items: center;
}
.header {
  background-color: #add8e6;
  position: fixed;
  padding: 10px;
  top: 0;
  z-index: 99;
}
ul {
  color: #add8e6;
}
ul.list {
  padding: 0 10px;
  margin-top: 60px;
  list-style-type: none;
}
.list li {
  padding: 10px 0;
  border-bottom: 3px dotted #add8e6;
  width: 100%;
  position: relative;
}
.list li:not(.isDone) .name {
  color: #333;
}
.list li .name {
  position: absolute;
  left: 40px;
}
.el-input__inner {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
input {
  font-family: "Balsamiq Sans", cursive;
  font-weight: 100 !important;
  box-sizing: border-box;
  border-radius: 50px !important;
  width: 100% !important;
}
.empty-circle {
  border: 3px solid;
  border-radius: 50%;
  width: 26px;
  display: inline-block;
  height: 26px;
  margin-bottom: -2px;
}
.delete {
  float: right;
}
.el-icon-check {
  padding-top: 2px;
}
</style>
