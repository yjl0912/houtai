<template>
  <div>
    <!--
      @change 当三级分类修改的时候触发。得到所有分类id
      @clearList 当1级分类和2级分类触发的时候触发，清空列表
      :disabled 决定select是否可以使用
     -->
    <Category :disabled =" !isShowList"/>
    <!--
      v-show 组件虽然是隐藏的，但是组件被加载了~
     -->
    <SpuShowList v-if="isShowList" @showUpdateList="showUpdateList" />
    <SpuUpdateList v-else :item="item" @showList="showList" />
  </div>
</template>

<script>
import Category from "@/components/Category";
import SpuShowList from "./spuShowList";
import SpuUpdateList from "./spuUpdateList";

export default {
  name: "SpuList",
  data() {
    return {
      isShowList: true,
      item: {},
    };
  },
  methods: {
    //spu更新组件点击保存时触发的函数
    //改变isShowList 的值，让list显示
    //重新请求页面内容
    showList(category3Id) {
      this.isShowList = true;
      //等ShowList组件加载完成，再触发事件
      this.$nextTick(() => {
        this.$bus.$emit("change", { category3Id });
      });
    },
    showUpdateList(row) {
      this.isShowList = false;
      this.item = { ...row };
    },
  },
  components: {
    Category,
    SpuShowList,
    SpuUpdateList,
  },
};
</script>
