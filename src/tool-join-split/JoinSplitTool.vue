<template>
  <el-container
    class="window"
    :class="[
      operation + '-mode',
      manualSplit ? 'manual-split' : '',
      setting.showFilename + '-show-filename',
      isAlt ? 'is-alt' : '',
    ]"
    :style="{
      '--image-selected-border-color': setting.imageSelectedBorderColor,
      '--group-selected-border-color': setting.groupSelectedBorderColor,
      '--split-line-color': setting.splitLineColor,
    }"
  >
    <el-header class="header">
      <div>
        <el-button
          type="primary"
          @click="onOpen"
          style="padding: 0 10px"
          tabindex="-1"
        >
          <i class="iconfont icon-image"></i>
          <span style="margin-left: 5px">{{ $t("joinSplitTool.open") }}</span>
        </el-button>

        <el-link
          :underline="false"
          @click="onClearList"
          :disabled="groups.length === 0"
          style="font-size: 12px; margin-left: 10px"
        >
          <i
            class="iconfont icon-f-clear"
            style="font-size: 12px; margin-right: 4px"
          ></i>
          {{ $t("joinSplitTool.clearList") }}
        </el-link>
      </div>

      <div class="lock-tool">
        <el-button-group>
          <el-button
            :title="lockBtn"
            :disabled="!lockEnable"
            @click="setLock(true)"
          >
            <i class="iconfont icon-lock"></i>
          </el-button>
          <el-button
            :title="unlockBtn"
            :disabled="!unlockEnable"
            @click="setLock(false)"
          >
            <i class="iconfont icon-unlock"></i>
          </el-button>
        </el-button-group>
      </div>

      <div class="operation-tool">
        <el-link
          :underline="false"
          style="font-size: 12px; margin-right: 20px"
          @click="tipsDialog = true"
        >
          <i class="iconfont icon-tips"></i>
          {{ $t("joinSplitTool.tips.title") }}
        </el-link>

        <el-button-group>
          <el-button
            :type="operation === 'join' ? 'primary' : ''"
            @click="operation = 'join'"
            style="padding: 0 10px"
          >
            <i class="iconfont icon-join"></i>
            <span style="margin-left: 5px">{{ $t("joinSplitTool.join") }}</span>
          </el-button>
          <el-button
            :type="operation === 'split' ? 'primary' : ''"
            @click="operation = 'split'"
            style="padding: 0 10px"
          >
            <i class="iconfont icon-split"></i>
            <span style="margin-left: 5px">{{
              $t("joinSplitTool.split")
            }}</span>
          </el-button>
        </el-button-group>
      </div>
    </el-header>

    <el-main style="display: flex">
      <el-container>
        <!-- START: images -->
        <el-main
          class="main images"
          :class="{ dragging, 'dragging-image': dragInfo.image }"
          :style="{
            overflow: curGroup ? 'hidden' : 'auto',
          }"
          ref="imagesWrapper"
          @click="onImagesContainerClick"
          @contextmenu="onImagesContainerContextmenu"
        >
          <!-- image list -->
          <GroupItem
            v-for="(group, i) in groups"
            :key="i"
            :group="group"
            :setting="setting"
            :style="{
              opacity: dragInfo.group === group && !dragInfo.image ? 0.5 : 1,
            }"
            :draggingImageIndex="
              dragInfo.group === group && dragInfo.image
                ? dragInfo.image.innerIndex
                : -1
            "
            @select-group="onSelectGroup($event)"
            @select-image="onSelectImage($event)"
            @remove-group="onRemoveGroup($event)"
            @remove-image="onRemoveImage($event)"
            @add-split-line="onAddSplitLine($event)"
            @show-group-detail="setCurGroup(group.index)"
            @lock-group="group.locked = $event"
            @group-mousedown="onGroupMousedown"
            @contextmenu.stop.prevent="
              onImagesContainerContextmenu($event, group)
            "
          />

          <!-- no image tip -->
          <div v-if="groups.length === 0" class="no-image">
            {{ $t("joinSplitTool.noImage") }}
          </div>

          <!-- START: image detail -->
          <div
            v-if="curGroup"
            class="group-detail-modal"
            :style="{ top: detailTop + 'px' }"
          >
            <div
              class="group-detail-wrapper"
              :class="{
                'is-space':
                  isSpace && curGroupState.zoom > curGroupState.fitZoom,
                moving: curGroupState.moving,
              }"
              @mousewheel="
                setZoom(curGroupState.zoom * ($event.deltaY < 0 ? 1.1 : 0.9))
              "
              @mousedown="onStartMove"
            >
              <GroupItem
                class="group-detail"
                :style="{
                  left: curGroupState.left + 'px',
                  top: curGroupState.top + 'px',
                }"
                :group="curGroup"
                :setting="setting"
                :curGroupZoom="curGroupState.zoom"
                @select-group="onStopMove"
                @add-split-line="
                  onAddSplitLine($event);
                  onStopMove();
                "
              />
            </div>

            <OrderBadge
              v-if="
                setting.joinOrder &&
                operation === 'join' &&
                curGroup.images.length > 1
              "
              type="join"
              :reverse="curGroup.join.reverse"
              :count="curGroup.images.length"
            />
            <OrderBadge
              v-if="
                setting.splitOrder &&
                operation === 'split' &&
                curGroup.split.lines.length > 0
              "
              type="split"
              :reverse="curGroup.split.reverse"
              :count="curGroup.split.lines.length + 1"
            />

            <div class="group-detail-btn close-btn" @click="onCloseGroupDetail">
              <i class="iconfont icon-f-clear"></i>
            </div>

            <div
              class="group-detail-btn prev-btn"
              :class="{ disabled: curGroup.index <= 0 }"
              @click="setCurGroup(curGroup.index - 1)"
            >
              <i class="iconfont icon-prev"></i>
            </div>
            <div
              class="group-detail-btn next-btn"
              :class="{ disabled: curGroup.index >= groups.length - 1 }"
              @click="setCurGroup(curGroup.index + 1)"
            >
              <i class="iconfont icon-next"></i>
            </div>

            <ZoomTool @zoom="onZoom" />
          </div>
          <!-- END: image detail -->

          <!-- dragging slot -->
          <div
            v-if="dragging"
            class="drag-slot"
            :style="{
              'background-color': dragInfo.slot.backgroundColor,
              left: dragInfo.slot.left + 'px',
              top: dragInfo.slot.top + 'px',
              width: dragInfo.slot.width + 'px',
              height: dragInfo.slot.height + 'px',
            }"
          ></div>
          <!-- image dragger -->
          <div
            v-if="dragInfo.image"
            class="dragger"
            :style="{
              left: dragInfo.dragger.x + 'px',
              top: dragInfo.dragger.y + 'px',
              width: dragInfo.image.width * dragInfo.group.zoom + 'px',
              height: dragInfo.image.height * dragInfo.group.zoom + 'px',
              'background-image': `url('${dragInfo.image.src}')`,
              'background-repeat': 'no-repeat',
              'background-size': `${
                dragInfo.image.width * dragInfo.group.zoom
              }px ${dragInfo.image.height * dragInfo.group.zoom}px`,
            }"
          ></div>
          <!-- group dragger -->
          <GroupItem
            v-else-if="dragInfo.group"
            class="dragger"
            :style="{
              left: dragInfo.dragger.x + 'px',
              top: dragInfo.dragger.y + 'px',
            }"
            :group="dragInfo.group"
            :setting="setting"
          />
        </el-main>
        <!-- END: images -->

        <!-- START: options -->
        <el-aside class="aside options">
          <!-- START: join options -->
          <el-form
            v-show="operation === 'join'"
            label-width="auto"
            @submit.prevent
          >
            <el-form-item
              :label="$t('joinSplitTool.joinDirection')"
              class="affix"
            >
              <ElDirection v-model="join.direction" />
            </el-form-item>

            <el-divider />

            <el-form-item :label="$t('joinSplitTool.joinCount')">
              <el-input-number
                :disabled="!!curGroup"
                v-model="join.count"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="$t('joinSplitTool.applyToSelectedGroups')"
                  :count="selectedGroupsCount"
                  :disabled="!!curGroup || selectedGroupsCount === 0"
                  @click="onApplyJoin('groups')"
                />
              </div>
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="$t('joinSplitTool.applyToSelectedImages')"
                  :count="selectedImagesCount"
                  :disabled="!!curGroup || selectedImagesCount === 0"
                  @click="onApplyJoin('images')"
                />
              </div>
            </el-form-item>

            <el-divider />

            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="$t('joinSplitTool.joinSelectedGroups')"
                  :count="selectedGroupsCount"
                  :disabled="!!curGroup || selectedGroupsCount === 0"
                  @click="onApplyJoin('groups', 'joinAll')"
                />
              </div>
            </el-form-item>

            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="$t('joinSplitTool.joinSelectedImages')"
                  :count="selectedImagesCount"
                  :disabled="!!curGroup || selectedImagesCount === 0"
                  @click="onApplyJoin('images', 'joinAll')"
                />
              </div>
            </el-form-item>

            <el-divider />

            <el-form-item :label="$t('joinSplitTool.reverse')">
              <el-switch v-model="join.reverse" />
            </el-form-item>
            <el-form-item :label="$t('joinSplitTool.resize')">
              <el-select v-model="join.resize">
                <el-option
                  v-for="item in ['max', 'min', 'original', 'custom']"
                  :key="item"
                  :label="$t('joinSplitTool.' + item)"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="join.resize === 'custom' && join.direction === 'vertical'"
              :label="$t('joinSplitTool.width')"
            >
              <el-input-number
                v-model="join.width"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item
              v-if="join.resize === 'custom' && join.direction === 'horizontal'"
              :label="$t('joinSplitTool.height')"
            >
              <el-input-number
                v-model="join.height"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('joinSplitTool.margin')">
              <el-input-number
                v-model="join.margin"
                controls-position="right"
                :min="0"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('joinSplitTool.background')">
              <ColorPicker v-model="join.background" />
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="applyToSelectedGroupsBtn"
                  :count="curGroup ? 0 : selectedGroupsCount"
                  :disabled="
                    (!curGroup && selectedGroupsCount === 0) ||
                    (curGroup && curGroup.locked)
                  "
                  @click="onApplyJoin('none')"
                />
              </div>
            </el-form-item>
          </el-form>
          <!-- END: join options -->

          <!-- START: split options -->
          <el-form
            v-show="operation === 'split'"
            label-width="auto"
            @submit.prevent
          >
            <el-form-item :label="$t('joinSplitTool.splitDirection')">
              <ElDirection v-model="split.direction" />
            </el-form-item>

            <el-divider />

            <el-form-item :label="$t('joinSplitTool.splitPattern')">
              <el-select v-model="split.type">
                <el-option
                  v-for="item in ['average', 'fixed']"
                  :key="item"
                  :label="$t(`joinSplitTool.${item}Split`)"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="split.type === 'average'"
              :label="$t('joinSplitTool.splitCount')"
            >
              <el-input-number
                v-model="split.count"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item v-else :label="$t('joinSplitTool.splitSize')">
              <el-input-number
                v-model="split.size"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="applyToSelectedGroupsBtn"
                  :count="curGroup ? 0 : selectedGroupsCount"
                  :disabled="
                    (!curGroup && selectedGroupsCount === 0) ||
                    (curGroup && curGroup.locked)
                  "
                  @click="onApplySplit(true)"
                />
              </div>
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <el-button
                  :disabled="splitHistoryCount === 0"
                  @click="onUndoSplit"
                  style="margin-right: 20px"
                >
                  {{ $t("joinSplitTool.undoSplit") }}
                </el-button>
                <BadgeButton
                  buttonType="default"
                  :label="$t('joinSplitTool.clearSplitLines')"
                  :count="curGroup ? 0 : selectedGroupsCount"
                  :disabled="
                    (!curGroup && selectedGroupsCount === 0) ||
                    (curGroup &&
                      (curGroup.locked || curGroup.split.lines.length === 0))
                  "
                  @click="onClearSplitLines"
                />
              </div>
            </el-form-item>

            <el-divider />

            <el-form-item>
              <div class="btn-form-item">
                <el-button
                  :type="manualSplit ? 'danger' : 'primary'"
                  @click="manualSplit = !manualSplit"
                  :disabled="groups.length === 0"
                >
                  {{
                    manualSplit
                      ? $t("joinSplitTool.quitManualSplit")
                      : $t("joinSplitTool.manualSplit")
                  }}
                </el-button>
              </div>
            </el-form-item>

            <el-divider />

            <el-form-item :label="$t('joinSplitTool.reverse')">
              <el-switch v-model="split.reverse" />
              <div
                class="description"
                v-html="$t('joinSplitTool.splitReverse_desc')"
              ></div>
            </el-form-item>
            <el-form-item>
              <div class="btn-form-item">
                <BadgeButton
                  :label="applyToSelectedGroupsBtn"
                  :count="curGroup ? 0 : selectedGroupsCount"
                  :disabled="
                    (!curGroup && selectedGroupsCount === 0) ||
                    (curGroup && curGroup.locked)
                  "
                  @click="onApplySplit(false)"
                />
              </div>
            </el-form-item>
          </el-form>
          <!-- END: split options -->
        </el-aside>
        <!-- END: options -->
      </el-container>
    </el-main>

    <el-footer class="footer">
      <div>
        <el-button @click="showSetting = true" style="padding: 0 10px">
          <i class="iconfont icon-setting" style="margin-right: 6px"></i>
          {{ $t("joinSplitTool.setting") }}
        </el-button>
      </div>
      <div style="flex: auto; padding: 0 10px">
        <FilePicker
          v-model="setting.outputFolder"
          :options="{
            nwdirectorydescKey: 'joinSplitTool.chooseOutputFolder',
            nwdirectory: true,
          }"
          :placeholder="$t('joinSplitTool.outputFolder')"
          class="footer-input"
        />

        <span class="footer-label" style="margin-left: 10px">
          {{ $t("joinSplitTool.format") }}
        </span>
        <el-select
          v-model="setting.format"
          class="footer-input"
          style="width: 100px"
        >
          <el-option
            v-for="item in ['JPEG', 'PNG', 'WebP']"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>

        <span class="footer-label" style="margin-left: 10px">
          {{ $t("joinSplitTool.quality") }}
        </span>
        <el-input-number
          v-model="setting.quality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          class="footer-input"
          style="width: 100px"
        ></el-input-number>
      </div>
      <div>
        <BadgeButton
          buttonType="default"
          :label="
            curGroup
              ? $t('joinSplitTool.saveCurrentGroup')
              : $t('joinSplitTool.saveSelectedGroups')
          "
          :count="curGroup ? 0 : selectedGroupsCountWithLocked"
          :disabled="!curGroup && selectedGroupsCountWithLocked === 0"
          @click="onSave(false)"
        />
        <el-button
          type="primary"
          :disabled="groups.length === 0"
          @click="onSave(true)"
          style="margin-left: 10px"
        >
          {{ $t("joinSplitTool.saveAll") }}
        </el-button>
      </div>
    </el-footer>

    <!-- START: setting -->
    <el-drawer
      v-model="showSetting"
      :title="$t('joinSplitTool.setting')"
      direction="rtl"
      :size="300"
      modal-class="setting-modal"
    >
      <el-form label-width="auto" @submit.prevent>
        <el-form-item :label="$t('joinSplitTool.afterProcessing')">
          <el-select v-model="setting.afterProcessing">
            <el-option
              v-for="item in [
                'none',
                'deleteSourceFile',
                'moveSourceFileToTrash',
              ]"
              :key="item"
              :label="$t('joinSplitTool.afterProcessingOptions.' + item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-divider style="margin: 40px 0">{{
          $t("joinSplitTool.displaySetting")
        }}</el-divider>
        <el-form-item :label="$t('joinSplitTool.showFilename')">
          <el-select v-model="setting.showFilename">
            <el-option
              v-for="item in ['always', 'hover', 'selected', 'never']"
              :key="item"
              :label="$t('joinSplitTool.' + item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('joinSplitTool.groupSelectedBorderColor')">
          <ColorPicker
            v-model="setting.groupSelectedBorderColor"
            :predefine="['#649CFA']"
          />
        </el-form-item>
        <el-form-item :label="$t('joinSplitTool.imageSelectedBorderColor')">
          <ColorPicker
            v-model="setting.imageSelectedBorderColor"
            :predefine="['#67C23A']"
          />
        </el-form-item>
        <el-form-item :label="$t('joinSplitTool.splitLineColor')">
          <ColorPicker
            v-model="setting.splitLineColor"
            :predefine="['#FF0000']"
          />
        </el-form-item>
        <el-form-item :label="$t('joinSplitTool.joinOrder')">
          <el-switch v-model="setting.joinOrder" />
        </el-form-item>
        <el-form-item :label="$t('joinSplitTool.splitOrder')">
          <el-switch v-model="setting.splitOrder" />
        </el-form-item>
      </el-form>
    </el-drawer>
    <!-- END: setting -->

    <!-- START: tips -->
    <el-dialog
      v-model="tipsDialog"
      :title="$t('joinSplitTool.tips.title')"
      width="80%"
      class="tips-dialog"
    >
      <el-divider content-position="left">{{
        $t("joinSplitTool.tips.listView")
      }}</el-divider>
      <p>
        <span class="keyboard">Alt</span>：<span
          v-html="$t('joinSplitTool.tips.altKey')"
        ></span>
      </p>
      <p>
        (<span class="keyboard">Ctrl</span>/<span class="keyboard">Shift</span>
        +)<i class="iconfont icon-mouse-left"></i>：<span
          v-html="$t('joinSplitTool.tips.selectGroup')"
        ></span>
      </p>
      <p>
        <span class="keyboard">Alt</span>+ (<span class="keyboard">Ctrl</span
        >/<span class="keyboard">Shift</span> +)<i
          class="iconfont icon-mouse-left"
        ></i
        >：<span v-html="$t('joinSplitTool.tips.selectImage')"></span>
      </p>
      <p>
        <i class="iconfont icon-drag-drop"></i>：<span
          v-html="$t('joinSplitTool.tips.dragDrop')"
        ></span>
      </p>
      <p>
        <span class="keyboard">Ctrl</span>+<span class="keyboard">Z</span
        >：<span v-html="$t('joinSplitTool.tips.undoSplit')"></span>
      </p>
      <p>
        <i class="iconfont icon-mouse-right"></i>：{{
          $t("joinSplitTool.tips.contextmenu")
        }}
      </p>
      <p>
        <i class="iconfont icon-lock"></i>：{{ $t("joinSplitTool.tips.lock") }}
      </p>

      <el-divider content-position="left">
        <i class="iconfont icon-detail"></i>
        {{ $t("joinSplitTool.tips.groupView") }}
      </el-divider>
      <p>
        <i class="iconfont icon-mouse-wheel"></i>：<span
          v-html="$t('joinSplitTool.tips.zoom')"
        ></span>
      </p>
      <p>
        <i class="iconfont icon-mouse-right"></i> / (<span class="keyboard"
          ><i class="iconfont icon-space"></i
        ></span>
        + <i class="iconfont icon-mouse-left"></i>)：{{
          $t("joinSplitTool.tips.move")
        }}
      </p>
    </el-dialog>
    <!-- END: tips -->
  </el-container>
</template>

<script>
import path from "path";
import url from "url";
import sharp from "sharp";
import clone from "clone";
import { showOpenDialog } from "nwjs-dialog";
import { handleDropImages, openAccept } from "@/util/imageFiles";
import { getCurrentScreen } from "@/util/util";
import { showLoading, showError, showSuccess } from "@/util/message";
import ColorPicker from "@/component/ColorPicker.vue";
import ZoomTool from "@/component/ZoomTool.vue";
import FilePicker from "@/component/FilePicker.vue";
import GroupItem from "./GroupItem.vue";
import ElDirection from "./ElDirection.vue";
import BadgeButton from "./BadgeButton.vue";
import OrderBadge from "./OrderBadge.vue";
import contextmenu from "./contextmenu.js";
import { save } from "./util";

const { scaleFactor } = getCurrentScreen();

const isCtrlKey = ($event) => $event.ctrlKey || $event.metaKey;
const removeItem = (list, item) => list.splice(list.indexOf(item), 1);

const defCurGroupState = {
  fitZoom: 0,
  minZoom: 0,
  zoom: 0,
  top: 0,
  left: 0,
  moving: false,
};
const defDragInfo = {
  group: null,
  image: null,
  wrapper: { left: 0, right: 0, top: 0, bottom: 0 },
  dragger: { x: 0, y: 0 },
  slot: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    groupIndex: -1,
    innerIndex: -1,
    isInsertBefore: false,
  },
};

let sx, sy, se;

let groupsState = [];
function getElState(el, group) {
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = el;
  let top = 0;
  let left = 0;
  if (group) {
    const { offsetTop, offsetLeft } = el.parentNode;
    top = group.top + offsetTop;
    left = group.left + offsetLeft;
  }
  return {
    index: parseInt(el.dataset[group ? "imageIndex" : "groupIndex"]),
    width: offsetWidth,
    height: offsetHeight,
    top: offsetTop + top,
    bottom: offsetTop + offsetHeight + top,
    middleTop: offsetTop + offsetHeight * 0.5 + top,
    left: offsetLeft + left,
    right: offsetLeft + offsetWidth + left,
    middleLeft: offsetLeft + offsetWidth * 0.5 + left,
  };
}
function updateGroupsState() {
  groupsState = Array.from(document.querySelectorAll("[data-group-index]")).map(
    ($group) => {
      const group = getElState($group);
      group.images = Array.from(
        $group.querySelectorAll("[data-image-index]")
      ).map(($image) => {
        return getElState($image, group);
      });
      return group;
    }
  );
}

let imagesWrapper;
let scrollTimer = -1;
function autoScroll(deltaY) {
  scrollTimer = setTimeout(() => {
    imagesWrapper.scrollTop += deltaY;
    autoScroll(deltaY);
  }, 10);
}

let splitHistory = [];

export default {
  name: "JoinSplitTool",
  components: {
    GroupItem,
    ElDirection,
    BadgeButton,
    OrderBadge,
    ColorPicker,
    ZoomTool,
    FilePicker,
  },
  data() {
    return {
      isAlt: false,
      isSpace: false,

      operation: "join",
      manualSplit: false,

      setting: {
        groupWidth: 300,
        groupHeight: 300,

        afterProcessing: "none",
        showFilename: "selected",
        joinOrder: true,

        splitLineColor: "#FF0000",
        splitOrder: true,

        imageSelectedBorderColor: "#67C23A",
        groupSelectedBorderColor: "#649CFA",

        outputFolder: "",
        format: "JPEG",
        quality: 80,
      },

      join: {
        direction: "horizontal",
        count: 2,
        reverse: false,
        resize: "max",
        width: 600,
        height: 600,
        margin: 0,
        background: "#FFFFFF",
      },

      split: {
        direction: "horizontal",
        type: "average",
        count: 1,
        size: 600,
        reverse: false,
      },

      groups: [],

      lastSelectedGroup: null,
      lastSelectedImage: null,

      curGroup: null,
      curGroupState: { ...defCurGroupState },
      detailTop: -1,

      dragInfo: { ...defDragInfo },

      showSetting: false,
      tipsDialog: false,

      splitHistoryCount: 0,
    };
  },

  computed: {
    applyToSelectedGroupsBtn() {
      return this.curGroup
        ? this.$t("joinSplitTool.applyToCurrentGroup")
        : this.$t("joinSplitTool.applyToSelectedGroups");
    },
    lockBtn() {
      return this.curGroup
        ? this.$t("joinSplitTool.lockCur")
        : this.$t("joinSplitTool.lock");
    },
    unlockBtn() {
      return this.curGroup
        ? this.$t("joinSplitTool.unlockCur")
        : this.$t("joinSplitTool.unlock");
    },
    lockEnable() {
      return this.curGroup
        ? !this.curGroup.locked
        : this.selectedGroupsCountWithLocked > 0;
    },
    unlockEnable() {
      return this.curGroup
        ? this.curGroup.locked
        : this.selectedGroupsCountWithLocked > 0;
    },
    images() {
      const images = [];
      this.groups.forEach((group) => {
        if (!group.locked) images.push(...group.images);
      });
      return images;
    },
    imagesWithLocked() {
      const images = [];
      this.groups.forEach((group) => images.push(...group.images));
      return images;
    },
    selectedGroupsCount() {
      let count = 0;
      this.groups.forEach((group) => {
        if (group.selected && !group.locked) count += 1;
      });
      return count;
    },
    selectedGroupsCountWithLocked() {
      let count = 0;
      this.groups.forEach((group) => {
        if (group.selected) count += 1;
      });
      return count;
    },
    selectedImagesCount() {
      let count = 0;
      this.groups.forEach((group) => {
        if (!group.locked) {
          group.images.forEach((image) => {
            if (image.selected) count += 1;
          });
        }
      });
      return count;
    },
    dragging() {
      return this.dragInfo.group;
    },
  },

  methods: {
    onOpen() {
      showOpenDialog({ accept: openAccept, multiple: true }).then((images) => {
        this.addImages(images);
      });
    },
    onClearList() {
      if (this.curGroup) this.onCloseGroupDetail();
      this.manualSplit = false;
      this.lastSelectedGroup = null;
      this.lastSelectedImage = null;
      groupsState = [];
      this.groups = [];
      splitHistory = [];
      this.splitHistoryCount = 0;
    },

    async addImages(images) {
      if (this.curGroup) this.onCloseGroupDetail();
      const loading = showLoading({
        lock: true,
        text: this.$t("joinSplitTool.adding"),
      });
      const newImages = await Promise.all(
        images.map(async (image) => {
          return {
            path: image,
            src: url.pathToFileURL(image).toString(),
            name: path.basename(image),
            meta: await sharp(image).metadata(),
            selected: false,
          };
        })
      ).catch(() => loading.close());
      const newGroups = this.createGroups(newImages);
      this.groups = this.groups.concat(newGroups);
      this.updateIndex();
      this.applySplit(this.groups.slice(-newGroups.length));
      loading.close();
    },

    createGroups(images, joinCount = this.join.count) {
      const { join, split } = this;
      const groups = [];
      for (let i = 0, count = images.length; i < count; i += joinCount) {
        const group = {
          images: images.slice(i, i + joinCount),
          join: { ...join, count: joinCount },
          split: { ...split, lines: [] },
          zoom: 1,
          locked: false,
          selected: true,
        };
        this.updateGroup(group);
        groups.push(group);
      }
      return groups;
    },

    insertGroup(index, group) {
      this.groups.splice(index, 0, group);
    },
    removeGroup(index) {
      this.removeGroupRecord(this.groups[index]);
      this.groups.splice(index, 1);
    },
    sortGroups() {
      this.groups.sort((a, b) => a.images[0].index - b.images[0].index);
    },
    updateIndex() {
      let imageCount = 0;
      this.groups.forEach((group, i) => {
        group.index = i;
        group.images.forEach((image, j) => {
          image.innerIndex = j;
          image.index = imageCount + j;
        });
        imageCount += group.images.length;
      });
    },

    setAllSelected(list, bool) {
      list.forEach((item) => (item.selected = bool));
    },
    invertAllSelected(list) {
      list.forEach((item) => (item.selected = !item.selected));
    },
    getSelectedGroups(withLocked = false) {
      return this.groups.filter(
        (group) => (withLocked || !group.locked) && group.selected
      );
    },
    getSelectedImages(group) {
      return group.images.filter((image) => image.selected);
    },

    setLock(bool) {
      const groups = this.curGroup
        ? [this.curGroup]
        : this.getSelectedGroups(true);
      groups.forEach((group) => {
        group.locked = bool;
        if (bool) this.setAllSelected(group.images, false);
      });
    },

    // @param joinTarget "none"|"images"|"groups"
    // @param joinType "none"|"joinAll"|"unjoin"
    onApplyJoin(joinTarget = "none", joinType = "none") {
      const { groups, curGroup, join } = this;
      if (curGroup && curGroup.locked) return;
      if (joinTarget !== "none" && !curGroup) {
        const images = [];
        if (joinTarget === "groups") {
          this.getSelectedGroups().forEach((group) => {
            images.push(...group.images);
            removeItem(groups, group);
          });
        } else {
          groups.slice(0).forEach((group) => {
            const selectedImages = this.getSelectedImages(group);
            if (selectedImages.length === group.images.length) {
              removeItem(groups, group);
            } else if (selectedImages.length > 0) {
              selectedImages.slice(0).forEach((image) => {
                removeItem(group.images, image);
              });
              this.updateGroup(group);
              this.clearSplitLines(group);
            }
            images.push(...selectedImages);
          });
        }
        this.setAllSelected(this.groups, false);
        this.setAllSelected(images, false);
        const joinCount =
          joinType === "joinAll"
            ? images.length
            : joinType === "unjoin"
            ? 1
            : join.count;
        this.setAllSelected(this.groups, false);
        this.groups = this.groups.concat(this.createGroups(images, joinCount));
        this.sortGroups();
        this.updateIndex();
      } else {
        const groups = curGroup ? [curGroup] : this.getSelectedGroups();
        groups.forEach((group) => {
          if (group.join.direction !== join.direction) {
            group.split.lines = [];
            this.removeGroupRecord(group);
          }
          group.join = { ...join };
          this.updateGroup(group);
        });
        if (curGroup) this.onResize();
      }
    },

    applySplit(groups) {
      const { split } = this;
      groups.forEach((group) => {
        const total =
          split.direction === "horizontal"
            ? group.totalWidth
            : group.totalHeight;
        const count =
          split.type === "average"
            ? split.count
            : Math.ceil(total / split.size);
        const part =
          split.type === "average" ? total / split.count : split.size;
        const lines = new Array(count - 1)
          .fill(0)
          .map((_, index) => Math.round((index + 1) * part));
        if (group.split.lines.join("_") !== lines.join("_")) {
          this.pushSplitRecord(group);
          group.split = { ...split, lines };
        }
      });
    },

    onApplySplit(doSplit) {
      const { curGroup } = this;
      if (curGroup && curGroup.locked) return;
      const groups = curGroup ? [curGroup] : this.getSelectedGroups();
      if (doSplit) {
        this.applySplit(groups);
      } else {
        const { split } = this;
        groups.forEach((group) => {
          if (group.split.direction !== split.direction) {
            group.split.lines = [];
            this.removeGroupRecord(group);
          }
          Object.assign(group.split, split);
        });
      }
    },

    updateGroup(group) {
      let { groupWidth, groupHeight } = this.setting;
      const { images, join } = group;
      const { direction, resize, margin, width, height } = join;
      const isHorizontal = direction === "horizontal";
      const isOriginal = resize === "original";
      let prop = isHorizontal ? "height" : "width";
      let size;
      if (resize === "max" || isOriginal) {
        size = Math.max(...images.map((image) => image.meta[prop]));
      } else if (resize === "min") {
        size = Math.min(...images.map((image) => image.meta[prop]));
      } else {
        size = isHorizontal ? height : width; // custom
      }
      images.forEach((image) => {
        image.scale = isOriginal ? 1 : size / image.meta[prop];
        image.width = Math.round(image.meta.width * image.scale);
        image.height = Math.round(image.meta.height * image.scale);
      });
      prop = isHorizontal ? "width" : "height";
      const total = images.reduce((total, image, i) => {
        total += image[prop];
        if (i > 0) total += margin;
        return total;
      }, 0);
      if (isHorizontal) {
        group.totalWidth = total;
        group.totalHeight = size;
      } else {
        group.totalWidth = size;
        group.totalHeight = total;
      }
      group.zoom = isHorizontal
        ? Math.min(groupWidth / total, groupHeight / size)
        : Math.min(groupHeight / total, groupWidth / size);
    },

    onSelectGroup({ $event, group }) {
      if ($event.altKey || (this.operation === "split" && this.manualSplit))
        return;
      const ctrlKey = isCtrlKey($event);
      if ($event.shiftKey) {
        if (!ctrlKey) this.setAllSelected(this.groups, false);
        const lastGroup = this.lastSelectedGroup || this.groups[0];
        const [start, end] = [lastGroup.index, group.index].sort(
          (a, b) => a - b
        );
        this.setAllSelected(this.groups.slice(start, end + 1), true);
      } else if (ctrlKey) {
        group.selected = !group.selected;
        if (this.lastSelectedGroup !== group) this.lastSelectedImage = null;
        this.lastSelectedGroup = group;
      } else {
        this.setAllSelected(this.groups, false);
        group.selected = true;
        if (this.lastSelectedGroup !== group) this.lastSelectedImage = null;
        this.lastSelectedGroup = group;
      }
    },

    // START: select image
    onSelectImage({ $event, group, image }) {
      if (!$event.altKey) return;
      const ctrlKey = isCtrlKey($event);
      if ($event.shiftKey) {
        if (!ctrlKey) this.setAllSelected(this.images, false);
        const lastGroup = this.lastSelectedGroup || this.groups[0];
        const [start, end] = [lastGroup.index, group.index].sort(
          (a, b) => a - b
        );
        if (start === end) {
          const lastImage = this.lastSelectedImage || lastGroup.images[0];
          const [start, end] = [lastImage.innerIndex, image.innerIndex].sort(
            (a, b) => a - b
          );
          this.setAllSelected(group.images.slice(start, end + 1), true);
        } else {
          // select all images between start group and end group
          this.groups
            .slice(start + 1, end)
            .forEach((group) => this.setAllSelected(group.images, true));
          // select images in start group and end group
          const selectGroupImages = (group, index, isEndGroup) => {
            const [start, end] =
              group.join.reverse + isEndGroup === 1
                ? [0, index]
                : [index, group.images.length - 1];
            this.setAllSelected(group.images.slice(start, end + 1), true);
          };
          if (!this.lastSelectedImage) {
            this.setAllSelected(lastGroup.images, true);
          } else {
            selectGroupImages(
              lastGroup,
              this.lastSelectedImage.innerIndex,
              lastGroup.index === end
            );
          }
          selectGroupImages(group, image.innerIndex, group.index === end);
        }
        // END: shift key
      } else if (ctrlKey) {
        image.selected = !image.selected;
        this.lastSelectedGroup = group;
        this.lastSelectedImage = image;
      } else {
        this.setAllSelected(this.images, false);
        image.selected = true;
        this.lastSelectedGroup = group;
        this.lastSelectedImage = image;
      }
    },
    // END: select image

    onImagesContainerClick($event) {
      if ($event.button !== 0 || $event.target !== imagesWrapper) return;
      if ($event.altKey) this.setAllSelected(this.images, false);
      else this.setAllSelected(this.groups, false);
      this.lastSelectedGroup = null;
      this.lastSelectedImage = null;
    },

    onImagesContainerContextmenu($event, group) {
      if ($event.altKey || this.curGroup) return;
      const groupEnabled = !!group && !group.locked;
      const hasGroups = this.groups.length > 0;
      const hasImages = this.images.length > 0;
      const hasSelectedGroups = this.selectedGroupsCount > 0;
      const hasSelectedImages = this.selectedImagesCount > 0;
      const nextGroup = groupEnabled && this.groups[group.index + 1];
      const enabledMap = {
        unjoinThisGroup: groupEnabled && group.images.length > 1,
        clearThisGroupSplitLines: groupEnabled && group.split.lines.length > 0,
        joinNextImage: !!nextGroup && !nextGroup.locked,
        selectBeforeGroups: !!group,
        selectAfterGroups: !!group,
        unjoinSelectedGroups: hasSelectedGroups,
        clearSelectedGroupsSplitLines: hasSelectedGroups,
        removeSelectedGroups: hasSelectedGroups,
        selectAllGroups: hasGroups,
        invertGroupsSelection: hasGroups,
        removeSelectedImages: hasSelectedImages,
        selectAllImages: hasImages,
        invertImagesSelection: hasImages,
      };
      contextmenu.popup(
        $event,
        ({ cmd }) => {
          switch (cmd) {
            case "unjoinThisGroup":
              removeItem(this.groups, group);
              this.setAllSelected(this.groups, false);
              this.groups = this.groups.concat(
                this.createGroups(group.images, 1)
              );
              this.sortGroups();
              this.updateIndex();
              break;
            case "clearThisGroupSplitLines":
              this.clearSplitLines(group);
              break;
            case "joinNextImage":
              this.joinNextImage(group);
              break;
            case "selectBeforeGroups":
              this.setAllSelected(this.groups, false);
              this.setAllSelected(this.groups.slice(0, group.index + 1), true);
              break;
            case "selectAfterGroups":
              this.setAllSelected(this.groups, false);
              this.setAllSelected(this.groups.slice(group.index), true);
              break;
            case "unjoinSelectedGroups":
              this.onApplyJoin("groups", "unjoin");
              break;
            case "clearSelectedGroupsSplitLines":
              this.getSelectedGroups().forEach((group) => {
                this.clearSplitLines(group);
              });
              break;
            case "removeSelectedGroups":
              this.removeSelectedGroups();
              break;
            case "selectAllGroups":
              this.setAllSelected(this.groups, true);
              break;
            case "invertGroupsSelection":
              this.invertAllSelected(this.groups);
              break;
            case "removeSelectedImages":
              this.removeSelectedImages();
              break;
            case "selectAllImages":
              this.setAllSelected(this.images, true);
              break;
            case "invertImagesSelection":
              this.invertAllSelected(this.images);
              break;
          }
        },
        enabledMap
      );
    },

    joinNextImage(group) {
      const next = this.groups[group.index + 1];
      group.images.push(next.images.shift());
      this.updateGroup(group);
      if (next.images.length === 0) {
        removeItem(this.groups, next);
      } else {
        this.clearSplitLines(next);
        this.updateGroup(group);
      }
      this.updateIndex();
      this.setAllSelected(this.groups, false);
      group.selected = true;
    },

    removeSelectedGroups() {
      if (this.selectedGroupsCount === 0) return;
      const { images, groups } = this;
      this.getSelectedGroups().forEach((group) => {
        group.images.forEach((image) => removeItem(images, image));
        removeItem(groups, group);
      });
      this.updateIndex();
    },

    removeSelectedImages() {
      if (this.selectedImagesCount === 0) return;
      const { images, groups } = this;
      groups.slice(0).forEach((group) => {
        this.getSelectedImages(group).forEach((image) => {
          removeItem(group.images, image);
          removeItem(images, image);
        });
        if (group.images.length === 0) removeItem(groups, group);
        else {
          this.updateGroup(group);
          this.clearSplitLines(group);
        }
      });
      this.updateIndex();
    },

    onRemoveGroup({ group }) {
      const { images, groups } = this;
      groups[group.index].images.forEach((image) => removeItem(images, image));
      this.removeGroup(group.index);
      this.updateIndex();
    },

    onRemoveImage({ group, imageIndex }) {
      const { images } = this;
      removeItem(images, group.images[imageIndex]);
      group.images.splice(imageIndex, 1);
      this.clearSplitLines(group);
      if (group.images.length === 0) {
        this.removeGroup(group.index);
      } else {
        this.updateGroup(group);
        this.clearSplitLines(group);
      }
      this.updateIndex();
    },

    pushSplitRecord(group) {
      splitHistory.push({ group, lines: [...group.split.lines] });
      splitHistory = splitHistory.slice(-100);
      this.splitHistoryCount = splitHistory.length;
    },
    removeGroupRecord(group) {
      splitHistory = splitHistory.filter((record) => record.group !== group);
      this.splitHistoryCount = splitHistory.length;
    },
    onAddSplitLine({ group, value, onAdded }) {
      if (this.operation !== "split" || !this.manualSplit) return;
      if (this.curGroup && (this.curGroup.locked || this.isSpace)) return;
      this.pushSplitRecord(group);
      group.split.lines.push(value);
      group.split.lines.sort((a, b) => a - b);
      onAdded();
    },
    clearSplitLines(group) {
      if (group.split.lines.length > 0) {
        this.pushSplitRecord(group);
        group.split.lines = [];
      }
    },
    onClearSplitLines() {
      const groups = this.curGroup ? [this.curGroup] : this.getSelectedGroups();
      groups.forEach((group) => this.clearSplitLines(group));
    },
    onUndoSplit() {
      const record = splitHistory.pop();
      if (record && record.group) {
        record.group.split.lines = record.lines;
        this.splitHistoryCount = splitHistory.length;
        this.groups = this.groups.slice(0);
      }
    },

    setCurGroup(index) {
      if (index < 0 || index > this.groups.length - 1) return;
      this.detailTop = imagesWrapper.scrollTop;
      this.curGroup = this.groups[index];
      this.onResize();
      this.onZoom("zoom-fit");
    },
    onCloseGroupDetail() {
      this.curGroup = null;
      this.curGroupState = { ...defCurGroupState };
      this.detailTop = -1;
    },

    // START: zoom
    onZoom(type) {
      switch (type) {
        case "zoom-in":
          this.setZoom(this.curGroupState.zoom + 0.1);
          break;
        case "zoom-out":
          this.setZoom(this.curGroupState.zoom - 0.1);
          break;
        case "zoom-1":
          this.setZoom(1 / scaleFactor);
          break;
        case "zoom-fit":
          this.setZoom(this.curGroupState.fitZoom);
          break;
      }
    },
    setZoom(zoom) {
      const { offsetWidth: W, offsetHeight: H } = imagesWrapper;
      const { totalWidth: tw, totalHeight: th } = this.curGroup;
      const { left: ol, top: ot, zoom: oz, minZoom } = this.curGroupState;
      zoom = Math.max(zoom, minZoom);
      const ow = tw * oz;
      const oh = th * oz;
      const w = tw * zoom;
      const h = th * zoom;
      // const center = { x: W * 0.5, y: H * 0.5 };
      const center = { x: 0, y: 0 };
      let left, top;
      if (w <= W) {
        left = Math.round((W - w) * 0.5);
      } else {
        left = center.x - ((center.x - Math.min(0, ol)) / ow) * w;
        if (left > 0) left = 0;
        if (left < W - w) left = W - w;
      }
      if (h <= H) {
        top = Math.round((H - h) * 0.5);
      } else {
        top = center.y - ((center.y - Math.min(0, ot)) / oh) * h;
        if (top > 0) top = 0;
        if (top < H - h) top = H - h;
      }
      Object.assign(this.curGroupState, { zoom, top, left });
    },
    onResize() {
      if (!this.curGroup) return;
      const { offsetWidth: W, offsetHeight: H } = imagesWrapper;
      const { totalWidth: w, totalHeight: h } = this.curGroup;
      this.curGroupState.fitZoom = Math.min(W / w, H / h);
      this.curGroupState.minZoom = Math.min(100 / w, 100 / h);
      this.setZoom(this.curGroupState.zoom);
      this.detailTop = imagesWrapper.scrollTop;
    },
    // END: zoom

    // START: move
    onStartMove($event) {
      if (
        this.operation === "split" &&
        this.manualSplit &&
        !this.isSpace &&
        $event.button !== 2
      )
        return;
      if (this.curGroupState.zoom <= this.curGroupState.fitZoom) return;
      this.curGroupState.moving = true;
      se = $event;
      sx = this.curGroupState.left;
      sy = this.curGroupState.top;
      window.addEventListener("mousemove", this.onMove);
      window.addEventListener("mouseup", this.onStopMove);
    },
    onMove($event) {
      const { offsetWidth: W, offsetHeight: H } = imagesWrapper;
      const { totalWidth: tw, totalHeight: th } = this.curGroup;
      const { zoom } = this.curGroupState;
      const w = tw * zoom;
      const h = th * zoom;

      // left
      let left = sx + $event.clientX - se.clientX;
      if (w < W) {
        left = Math.round((W - w) * 0.5);
      } else {
        if (left > 0) left = 0;
        if (left < W - w) left = W - w;
      }

      // top
      let top = sy + $event.clientY - se.clientY;
      if (h < H) {
        top = Math.round((H - h) * 0.5);
      } else {
        if (top > 0) top = 0;
        if (top < H - h) top = H - h;
      }

      Object.assign(this.curGroupState, { left, top });
    },
    onStopMove() {
      window.removeEventListener("mousemove", this.onMove);
      window.removeEventListener("mouseup", this.onStopMove);
      this.curGroupState.moving = false;
    },
    // END: move

    // START: drag
    onGroupMousedown($event) {
      if (
        $event.button !== 0 ||
        (this.operation === "split" && this.manualSplit)
      )
        return;
      const contains = (c) => $event.target.classList.contains(c);
      if (
        contains("group-box") ||
        contains("group-content") ||
        contains("img")
      ) {
        se = $event;
        window.addEventListener("mousemove", this.checkDrag);
        window.addEventListener("mouseup", this.stopDrag);
      }
    },
    checkDrag($event) {
      if (!this.dragging) {
        if (
          Math.abs($event.pageX - se.pageX) > 10 ||
          Math.abs($event.pageY - se.pageY) > 10
        ) {
          const { dragInfo } = this;
          dragInfo.wrapper = imagesWrapper.getBoundingClientRect();
          updateGroupsState();
          const $group = se.target.closest("[data-group-index]");
          const groupIndex = parseInt($group.dataset.groupIndex);
          dragInfo.group = this.groups[groupIndex];
          const $image = se.target.closest("[data-image-index]");
          if ($image) {
            const imageIndex = parseInt($image.dataset.imageIndex);
            dragInfo.image = this.imagesWithLocked[imageIndex];
          }
          this.dragMove($event);
        }
      } else {
        this.dragMove($event);
      }
    },
    dragMove($event) {
      const { wrapper, image } = this.dragInfo;

      this.dragInfo.dragger = { x: $event.pageX, y: $event.pageY };

      // auto scroll
      if ($event.pageY < wrapper.top + 20) {
        if (scrollTimer === -1) autoScroll(-10);
      } else if ($event.pageY > wrapper.bottom - 20) {
        if (scrollTimer === -1) autoScroll(10);
      } else if (scrollTimer !== -1) {
        clearTimeout(scrollTimer);
        scrollTimer = -1;
      }

      // if (
      //   Math.abs($event.pageX - se.pageX) < 10 &&
      //   Math.abs($event.pageY - se.pageY) < 10
      // )
      //   return;
      // se = $event;

      const x = $event.pageX - wrapper.left;
      const y = $event.pageY - wrapper.top + imagesWrapper.scrollTop;
      const matchRow = [];
      for (let group of groupsState) {
        if (matchRow.length > 0 && group.bottom !== matchRow[0].bottom) break;
        if (group.bottom > y) matchRow.push(group);
      }
      const group =
        matchRow.find((group) => group.right > x) ||
        matchRow[matchRow.length - 1] ||
        groupsState[groupsState.length - 1];
      if (
        image &&
        !this.groups[group.index].locked &&
        x >= group.left &&
        x <= group.right &&
        y >= group.top &&
        y <= group.bottom
      ) {
        const join = this.groups[group.index].join;
        const m = join.reverse ? "findLastIndex" : "findIndex";
        const defIndex = join.reverse ? 0 : group.images.length - 1;
        if (join.direction === "horizontal") {
          let index = group.images[m]((image) => image.right > x);
          if (index === -1) index = defIndex;
          const image = group.images[index];
          const isInsertBefore = x < image.middleLeft;
          this.dragInfo.slot = {
            backgroundColor: this.setting.imageSelectedBorderColor,
            left: x < image.middleLeft ? image.left : image.right - 10,
            top: group.top,
            width: 10,
            height: group.height,
            groupIndex: group.index,
            innerIndex: index,
            isInsertBefore: join.reverse ? !isInsertBefore : isInsertBefore,
          };
        } else {
          let index = group.images[m]((image) => image.bottom > y);
          if (index === -1) index = defIndex;
          const image = group.images[index];
          const isInsertBefore = y < image.middleTop;
          this.dragInfo.slot = {
            backgroundColor: this.setting.imageSelectedBorderColor,
            left: group.left,
            top: y < image.middleTop ? image.top : image.bottom - 10,
            width: group.width,
            height: 10,
            groupIndex: group.index,
            innerIndex: index,
            isInsertBefore: join.reverse ? !isInsertBefore : isInsertBefore,
          };
        }
      } else {
        this.dragInfo.slot = {
          backgroundColor: this.setting.groupSelectedBorderColor,
          left: x < group.middleLeft ? group.left - 11 : group.right + 1,
          top: group.top,
          width: 10,
          height: group.height,
          groupIndex: group.index,
          innerIndex: -1,
          isInsertBefore: x < group.middleLeft,
        };
      }
    },
    stopDrag() {
      window.removeEventListener("mousemove", this.checkDrag);
      window.removeEventListener("mouseup", this.stopDrag);
      clearTimeout(scrollTimer);
      scrollTimer = -1;

      const { groups, dragInfo } = this;
      const { group, image, slot } = dragInfo;
      if (image) {
        // insert into group
        if (slot.innerIndex !== -1) {
          if (
            slot.groupIndex !== group.index ||
            slot.innerIndex !== image.innerIndex
          ) {
            // insert image to new position
            const insertGroup = groups[slot.groupIndex];
            const innerIndex = slot.innerIndex;
            const insertIndex = innerIndex + (slot.isInsertBefore ? 0 : 1);
            insertGroup.images.splice(insertIndex, 0, image);
            this.updateGroup(insertGroup);
            // this.clearSplitLines(insertGroup);
            // delete image from old position
            const deleteIndex =
              slot.groupIndex !== group.index ||
              slot.innerIndex > image.innerIndex
                ? image.innerIndex
                : image.innerIndex + 1;
            group.images.splice(deleteIndex, 1);
            if (group.images.length === 0) {
              this.removeGroup(group.index);
            } else {
              this.updateGroup(group);
              this.clearSplitLines(group);
              this.removeGroupRecord(group);
            }
            this.updateIndex();
          }
        } else {
          // add new group
          const insertIndex = slot.groupIndex + (slot.isInsertBefore ? 0 : 1);
          const newGroup = { ...clone(group), images: [image] };
          this.updateGroup(newGroup);
          this.clearSplitLines(newGroup);
          this.insertGroup(insertIndex, newGroup);
          // delete image from old position
          group.images.splice(image.innerIndex, 1);
          if (group.images.length === 0) {
            const deleteIndex =
              slot.groupIndex > group.index ? group.index : group.index + 1;
            this.removeGroup(deleteIndex);
          } else {
            this.updateGroup(group);
            this.clearSplitLines(group);
            this.removeGroupRecord(group);
          }
          this.updateIndex();
        }
      } else if (group && slot.groupIndex !== group.index) {
        // insert group to new position
        const insertIndex = slot.groupIndex + (slot.isInsertBefore ? 0 : 1);
        this.insertGroup(insertIndex, group);
        // delete group from old position
        const deleteIndex =
          slot.groupIndex > group.index ? group.index : group.index + 1;
        this.removeGroup(deleteIndex);
        this.updateIndex();
      }
      this.dragInfo = { ...defDragInfo };
    },
    // END: drag

    async onSave(isSaveAll) {
      // if (!this.setting.outputFolder) {
      //   await showOpenDialog({
      //     nwdirectory: true,
      //     nwdirectorydesc: this.$t("joinSplitTool.chooseOutputFolder"),
      //   }).then(([dirPath]) => {
      //     this.setting.outputFolder = dirPath;
      //   });
      // }
      // if (this.setting.outputFolder) {
      let groups;
      if (isSaveAll) groups = this.groups;
      else if (this.curGroup) groups = [this.curGroup];
      else groups = this.getSelectedGroups(true);

      const total = groups.length;
      const loading = showLoading({
        lock: true,
        text: `0/${total}`,
      });
      save(groups, this.setting, (index) => {
        if (index < total - 1) loading.setText(`${index + 1}/${total}`);
      })
        .then(() => {
          loading.close();
          showSuccess(this.$t("joinSplitTool.completed"));
        })
        .catch((err) => {
          loading.close();
          showError(this.$t("joinSplitTool.failed"), err);
          console.error(err);
        });
      // }
    },
  },

  mounted() {
    imagesWrapper = this.$refs.imagesWrapper.$el;

    handleDropImages(async (images) => {
      this.addImages(images.map((image) => image.path));
    }, true);

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (e.key === "Escape" && this.curGroup) this.onCloseGroupDetail();
      else if (isCtrlKey(e) && e.key === "z") this.onUndoSplit();
      else if (e.key === "Alt") this.isAlt = true;
      else if (isCtrlKey(e) && e.key === "o") this.onOpen();
      else if (e.key === "a") {
        if (e.altKey) this.setAllSelected(this.images, true);
        else if (isCtrlKey(e)) this.setAllSelected(this.groups, true);
      } else if (e.key === "Delete" && e.target.tagName !== "INPUT") {
        if (isCtrlKey(e)) this.onClearList();
        else if (e.altKey) this.removeSelectedImages();
        else this.removeSelectedGroups();
      } else if (this.curGroup && e.code === "Space") this.isSpace = true;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Alt") this.isAlt = false;
      else if (this.curGroup && e.code === "Space") this.isSpace = false;
    });

    window.addEventListener("contextmenu", (e) => {
      if (e.target.tagName !== "INPUT") {
        e.preventDefault();
        return false;
      }
    });
    window.addEventListener("resize", this.onResize);
  },
};
</script>

<style>
* {
  -webkit-user-drag: none;
  user-select: none;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

.el-drawer__header {
  margin-bottom: 0;
}
.setting-modal {
  background-color: rgba(0, 0, 0, 0.001);
}

.el-dialog__body {
  padding-top: 0;
}
.keyboard {
  display: inline-block;
  border: 1px solid #cdd0d6;
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 4px;
}
.keyboard.square {
  width: 16px;
  padding: 2px;
  text-align: center;
}
.keyboard + .keyboard {
  margin-left: 2px;
}
</style>

<style scoped>
/* layout start */
.el-container,
.el-header,
.el-main,
.el-aside,
.el-footer {
  padding: 0;
}
.window {
  width: 100%;
  height: 100%;
  background-color: #f2f3f5;
}
.header {
  --el-header-height: initial;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  display: flex;
  flex-flow: row nowrap;
}
/* .main {} */
.aside {
  width: 250px;
  border-left: 1px solid #ccc;
  display: flex;
  flex-flow: column;
}
.footer {
  --el-footer-height: initial;
  padding: 10px;
  border-top: 1px solid #ccc;
  display: flex;
  flex-flow: row nowrap;
}
/* layout end */

.lock-tool {
  flex: auto;
  text-align: right;
}
.operation-tool {
  min-width: 230px;
  flex-shrink: 0;
  text-align: right;
  padding-left: 10px;
}

.images {
  background-color: #ced0d6;
  padding: 6px;
  display: flex;
  flex-flow: row wrap;
  align-content: start;
  position: relative;
}
.no-image {
  font-size: 14px;
  color: #606266;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.options {
  padding: 20px 10px;
  overflow: auto;
}
.description {
  width: 100%;
  color: #909399;
  line-height: 24px;
  word-break: break-word;
}

.btn-form-item {
  width: 100%;
  text-align: right;
}

.footer-label {
  font-size: 12px;
}
.footer-input {
  display: inline-block;
  max-width: 200px;
}

.group-detail-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
}
.group-detail-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.group-detail {
  position: absolute;
  margin: 0;
}
.group-detail-btn {
  position: absolute;
  padding: 10px;
  opacity: 0.3;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  transition: 0.1s;
}
.group-detail-btn:hover {
  opacity: 1;
  background-color: #f56c6c;
}
.group-detail-btn.disabled {
  display: none;
}
.group-detail-btn.close-btn {
  top: 0;
  right: 0;
}
.group-detail-btn.prev-btn {
  top: 50%;
  transform: translateY(-50%);
  left: 0;
}
.group-detail-btn.next-btn {
  top: 50%;
  transform: translateY(-50%);
  right: 0;
}
.group-detail-modal .order-badge {
  padding: 10px;
}
.zoom-tool {
  position: absolute;
  left: 4px;
  bottom: 4px;
}
.group-detail-wrapper.is-space {
  cursor: grab;
}
.group-detail-wrapper.moving {
  cursor: grabbing;
}

.drag-slot {
  position: absolute;
  pointer-events: none;
}
.dragger {
  z-index: 1000;
  position: fixed;
  opacity: 0.5;
  transform: translate(-50%, -50%);
  pointer-events: auto !important;
  cursor: grabbing;
  outline: none !important;
}
</style>
