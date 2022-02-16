<template>
  <div>
    <a-table bordered :data-source="data">
      <a-table-column key="name" title="名称" data-index="name" />
      <a-table-column key="version" title="版本号" data-index="version" />
      <a-table-column key="tags" title="标签" data-index="tags">
        <template slot-scope="tags">
          <a-tag
            v-for="tag in tags && tags.split(',')"
            :key="tag"
          >
            {{ tag }}
          </a-tag>
        </template>
      </a-table-column>
      <a-table-column key="description" title="描述" data-index="description" />
      <a-table-column key="uri" title="包体" data-index="uri">
        <template slot-scope="uri">
          <a :href="uri" target="_blank">{{ uri }}</a>
        </template>
      </a-table-column>
      <a-table-column key="poster" title="海报" data-index="poster">
        <template slot-scope="poster">
          <a :href="poster" target="_blank">{{ poster }}</a>
        </template>
      </a-table-column>
      <a-table-column key="pass" title="状态" data-index="pass">
        <template slot-scope="pass">
          <a-tag :color="pass ? 'green' : 'red'">{{ pass ? '通过' : '拒绝' }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column key="action" title="操作">
        <template slot-scope="text">
          <span>
            <a @click="handleAudit(text)">审核</a>
          </span>
        </template>
      </a-table-column>
    </a-table>
    <a-modal
      title="审核"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form class="form" :form="form">
        <a-form-item label="名称">
          <a-input
            type="text"
            placeholder="请输入密钥"
            v-decorator="['key', { rules: [{ required: true, message: '请输入密钥!' }] }]"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            placeholder="请选择状态"
            v-decorator="['pass', { rules: [{ required: true, message: '请选择状态!' }] }]"
          >
            <a-select-option value="true">
              通过
            </a-select-option>
            <a-select-option value="false">
              拒绝
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Audit',
  data() {
    return {
      data: [],
      id: -1,
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this)
    }
  },
  mounted() {
    this.handleMods()
  },
  methods: {
    handleMods() {
      axios.get('/getAllMods')
        .then((response) => {
          const { data: { data } } = response
          this.data = data
        })
    },
    handleAudit(text) {
      this.visible = true
      this.id = text.id
    },
    handleOk(e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          console.log(values)
          const { key, pass } = values
          axios.post('/auditById', {
            id: this.id,
            key,
            pass: pass === 'true' ? true : false
          })
          .then((res) => {
            this.visible = false
            this.confirmLoading = false
            const { data: { msg, data } } = res
            if (data) {
              this.$message.success({ content: msg })
            } else {
              this.$message.error({ content: msg })
            }

          })
        }
      })
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>

<style>

</style>