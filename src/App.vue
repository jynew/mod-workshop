<template>
  <div id="app">
    <div class="main">
      <a-form class="form" :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <a-form-item label="名称">
          <a-input
            type="text"
            placeholder="请输入mod的名称"
            v-decorator="['name', { rules: [{ required: true, message: '请输入mod的名称!' }] }]"
          />
        </a-form-item>
        <a-form-item label="版本号">
          <a-input
            type="text"
            placeholder="请输入mod的版本号"
            v-decorator="['version', { rules: [{ required: true, message: '请输入mod的版本号!' }] }]"
          />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            mode="tags"
            placeholder="请输入mod的标签"
            v-decorator="['tagArr']"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea
            placeholder="请输入mod的描述"
            :rows="4"
            v-decorator="['description']"
          />
        </a-form-item>
        <a-form-item label="包体">
          <a-upload-dragger
            :file-list="fileList"
            :remove="handleRemove"
            :before-upload="beforeUpload1"
            @change="handleChange1"
            v-decorator="['uploadFile', { rules: [{ required: true, message: '请上传mod的包体!' }] }]"
          >
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">
              单击或拖动单文件到该区域进行上传
            </p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="海报">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload2"
            @change="handleChange2"
            v-decorator="['uploadImg']"
          >
            <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
            <div v-else>
              <a-icon type="plus" />
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button class="button" type="primary" html-type="submit">
            提交
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
export default {
  name: 'App',
  data() {
    return {
      fileList: [],
      imageUrl: '',
      form: this.$form.createForm(this)
    }
  },
  methods: {
    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload1(file) {
      this.fileList = [...this.fileList, file]
      return false
    },
    handleChange1(info) {
      let fileList = [...info.fileList]
      fileList = fileList.slice(-1)
      this.fileList = fileList
    },
    handleChange2(info) {
      if(!this.validate(info.file)) return
      getBase64(info.fileList[0].originFileObj, imageUrl => {
        this.imageUrl = imageUrl
      })
    },
    validate(file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        this.$message.error('只能上传JPG/PNG图片!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不超过2M!')
      }
      return isJpgOrPng && isLt2M
    },
    beforeUpload2() {
      return false
    },
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const { name, version, tagArr = [], description = '', uploadFile, uploadImg } = values
          const tags = tagArr.join(',')
          const file = uploadFile.file
          const img = uploadImg && uploadImg.file
          const formData = new FormData()
          formData.append('name', name)
          formData.append('version', version)
          tags && formData.append('tags', tags)
          description && formData.append('description', description)
          formData.append('file', file)
          this.imageUrl && formData.append('img', img)
          const key = 'upload'
          this.$message.loading({ content: '上传中，请勿关闭...', key, duration: 0 })
          axios({
            method: 'post',
            url: '/createMod',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((res) => {
            const { data: { msg, data } } = res
            if (data) {
              this.$message.success({ content: msg, key })
            } else {
              this.$message.error({ content: msg, key })
            }
            this.reset()
          })
          .catch(() => {
            this.$message.error({ content: '上传失败', key })
          })
        }
      })
    },
    reset() {
      this.fileList = []
      this.imageUrl = ''
      this.form = this.$form.createForm(this)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.main {
  width: 800px;
  margin: 0 auto;
}
</style>