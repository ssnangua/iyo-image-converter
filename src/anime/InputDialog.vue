<template>
  <div>
    <MsgDialog
      ref="dialog"
      v-bind="dialog"
      v-model="visible"
      @checked-change="dialog.checked = !dialog.checked"
      @confirm="confirm"
      @cancel="visible = false"
    >
      <div v-if="name === 'otherSize'">
        <span>
          <el-input-number
            ref="autofocus"
            v-model="data.width"
            :step="1"
            :step-strictly="true"
            :min="1"
            :max="10000"
            controls-position="right"
            @keypress.enter="confirm"
            style="width: 100px"
          />
        </span>
        <span style="margin: 0 10px">×</span>
        <span>
          <el-input-number
            ref="heightInput"
            v-model="data.height"
            controls-position="right"
            :step="1"
            :step-strictly="true"
            :min="1"
            :max="10000"
            @keypress.enter="
              $refs.heightInput.blur();
              confirm();
            "
            style="width: 100px"
          />
        </span>
      </div>
      <div v-else-if="name === 'otherLoop'">
        <el-input-number
          ref="autofocus"
          v-model="data"
          :step="1"
          :step-strictly="true"
          :min="0"
          :max="100000"
          controls-position="right"
          @keypress.enter="confirm"
          style="width: 100px"
        />
        <span style="margin-left: 10px">{{ $t("animeTool.loopUnit") }}</span>
        <p v-html="$t('animeTool.infiniteLoop')"></p>
      </div>
      <div v-else-if="name === 'otherDelay'">
        <el-input-number
          ref="autofocus"
          v-model="data"
          :step="0.001"
          :step-strictly="true"
          :min="0"
          :max="100000"
          controls-position="right"
          @keypress.enter="confirm"
          style="width: 100px"
        />
        <span style="margin-left: 10px">{{ $t("animeTool.delayUnit") }}</span>
      </div>
    </MsgDialog>
  </div>
</template>

<script>
import MsgDialog from "@/component/MsgDialog.vue";

export default {
  name: "InputDialog",
  components: { MsgDialog },

  data() {
    return {
      name: "",
      visible: false,
      dialog: {
        title: "",
        type: "",
        message: "",
        checkboxText: "",
        checked: "",
        showConfirmButton: true,
        showCancelButton: true,
        confirmText: "",
        cancelText: "",
      },
      data: null,
    };
  },

  methods: {
    show(options) {
      const { name, data, ...dialog } = options;
      this.dialog = Object.assign(
        {
          title: "",
          type: "",
          message: "",
          checkboxText: "",
          checked: false,
          showConfirmButton: true,
          showCancelButton: true,
          confirmText: "",
          cancelText: "",
        },
        dialog
      );
      this.name = name;
      this.data = data;

      setTimeout(() => {
        const { autofocus, dialog } = this.$refs;
        if (autofocus) autofocus.focus();
        else dialog.autofocus();
      }, 0);

      this.visible = true;
    },

    confirm() {
      this.$refs.autofocus?.blur();
      this.$emit("confirm", this.name, this.data, this.dialog.checked);
      this.visible = false;
    },
  },
};
</script>
