<template>
  <div>
    <el-button type="primary" @click="add" icon="el-icon-plus">添加</el-button>

    <el-table
    :data="trademarkList"
    border style="width: 100%;
    margin: 20px 0"
    v-loading='loading'>
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column label="品牌LOGO">
        <template v-slot="scope">
          <img class="trademark-img" :src="scope.row.logoUrl" alt="logo" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button type="warning" icon="el-icon-edit" @click="update(row)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="trademark-pagination"
      @size-change="getPageList(page, $event)"
      @current-change="getPageList($event, limit)"
      :page-sizes="[3, 6, 9]"
      :page-size.sync="limit"
      :current-page="page"
      layout="prev,pager,next,jumper,sizes,total"
      :total="total"
    >
    </el-pagination>

    <el-dialog
      :title="`${trademarkForm.id ? '修改' : '添加'}品牌`"
      :visible.sync="visible"
      width="50%"
    >
      <el-form
        :model="trademarkForm"
        :rules="rules"
        ref="trademarkForm"
        label-width="100px"
      >
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="trademarkForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademarkForm.logoUrl"
              :src="trademarkForm.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span>只能上传jpg/png文件，且不超过50kb</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('trademarkForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import {trademark} from '@/api' trademark已经被拓展到原型对象上，不需要引入了
export default {
  name: "TrademarkList",
  data() {
    return {
      trademarkList: [],
      total: 0,
      page: 1,
      limit: 3,
      visible: false, // 对话框显示&隐藏
      trademarkForm: {
        // 表单数据
        tmName: "",
        logoUrl: "",
      },
      rules: {
        // 表单校验规则
        tmName: [
          {
            // 必填项
            required: true,
            // 错误信息
            message: "请输入品牌名称",
            // 触发表单校验时机
            trigger: "blur",
          },
        ],
        logoUrl: [{ required: true, message: "请上传品牌LOGO" }],
      },
      loading:false
    };
  },
  methods: {
    validator(rule, value, callback) {
      /*
        rule  校验的字段名
        value 校验的字段值
        callback 决定表单校验成功/失败
      */
      // 其中callback必须调用
      if (!value) {
        callback(new Error("请输入品牌名称"));
        return;
      } else if (value.length < 2 || value.length > 10) {
        callback(new Error("输入品牌名称的长度应为2-10位"));
        return;
      }

      callback();
    },

    add() {
      this.$refs.trademarkForm && this.$refs.trademarkForm.clearValidate();
      this.visible = true;
      this.trademarkForm = { tmName: "", logoUrl: "" };
      //本来要将trademarkForm设置为空对象，但为了图片添加时能显示，让其成为响应式数据，要存在，值为空
    },
    update(row) {
      this.$refs.trademarkForm && this.$refs.trademarkForm.clearValidate();
      this.visible = true;
      this.trademarkForm = { ...row };
    },
    // 提交表单
    submitForm(form) {
      // 校验表单
      this.$refs[form].validate(async (valid) => {
        if (valid) {
          const { trademarkForm } = this;
          // 代表是否是更新
          const isUpdate = !!trademarkForm.id;

          // 如果是修改需要验证
          if (isUpdate) {
            const tm = this.trademarkList.find(
              (tm) => tm.id === trademarkForm.id
            );

            if (
              tm.tmName === trademarkForm.tmName &&
              tm.logoUrl === trademarkForm.logoUrl
            ) {
              this.$message.warning("不能提交与之前一样的数据");
              return;
            }
          }

          // 表单校验通过
          // console.log(this.trademarkForm);
          // 发送请求
          let result;

          if (isUpdate) {
            result = await this.$API.trademark.updateTrademark(trademarkForm);
          } else {
            result = await this.$API.trademark.addTrademark(trademarkForm);
          }
          // 表单校验通过
          // console.log(this.trademarkForm);
          // 发送请求

          if (result.code === 200) {
            this.$message.success("添加品牌数据成功~");
            this.visible = false; // 隐藏对话框
            this.getPageList(this.page, this.limit); // 请求加载新数据
          } else {
            this.$message.error(result.message);
          }
        }
      });
    },
    // 上传图片成功的回调
    handleAvatarSuccess(res) {
      // console.log(res.data); // 图片地址
      this.trademarkForm.logoUrl = res.data;
    },
    // 上次图片之前触发的回调
    beforeAvatarUpload(file) {
      // console.log(file);
      const imgTypes = ["image/jpg", "image/png", "image/jpeg"];
      // 检测文件类型
      const isValidType = imgTypes.indexOf(file.type) > -1;
      // 检测文件大小
      const isLt = file.size / 1024 < 50;

      if (!isValidType) {
        this.$message.error("上传品牌LOGO只能是 JPG 或 PNG 格式!");
      }
      if (!isLt) {
        this.$message.error("上传品牌LOGO大小不能超过 50 kb!");
      }
      // 返回值为true，代表可以上传
      // 返回值为false，代表不可以上传
      return isValidType && isLt;
    },

    async getPageList(page = 1, limit = 3) {
      this.loading = true;
      const result = await this.$API.trademark.getPageList(page, limit);
      if (result.code === 200) {
        this.$message.success("获取品牌分页列表成功");
        this.trademarkList = result.data.records;
        this.total = result.data.total;
        this.page = result.data.current;
        this.limit = result.data.size;
      } else {
        this.$message.error("获取品牌分页列表失败");
      }
      this.loading = false;
    },
  },

  mounted() {
    this.getPageList(this.page, this.limit);
  },
};
</script>
<style lang="sass" scoped>
.trademark-img
  width: 150px

.trademark-pagination
  text-align: right

>>>.el-pagination__sizes
  margin-left: 250px

>>>.avatar-uploader .el-upload
  border: 1px dashed #d9d9d9
  border-radius: 6px
  cursor: pointer
  position: relative
  overflow: hidden
  &:hover
    border-color: #409EFF

>>>.avatar-uploader-icon
  font-size: 28px
  color: #8c939d
  width: 178px
  height: 178px
  line-height: 178px
  text-align: center

>>>.avatar
  width: 178px
  height: 178px
  display: block
</style>
