from django.contrib.gis import admin
from huts.models import Hut, HutSuggestion, HutEdit, Agency, Region,\
                        Designation, System, AccessType, HutType, Service
from huts.forms import HutForm, HutSuggestionForm, HutEditForm

class RegionAdmin(admin.ModelAdmin):
    search_fields = ('region',)

class LabelAdmin(admin.ModelAdmin):
    prepopulated_fields = {'identifier': ('name',)}

class DesignationAdmin(LabelAdmin):
    pass

class SystemAdmin(LabelAdmin):
    pass

class AccessTypeAdmin(LabelAdmin):
    pass

class HutTypeAdmin(LabelAdmin):
    pass

class ServiceAdmin(LabelAdmin):
    pass

class HutCommonAdmin(admin.ModelAdmin):
    list_display = ('name', 'updated')
    list_filter = ('updated',)
    search_fields = ('name', 'alternate_names', 'agency__name', 'agency__parent__name', 'region__region')

class HutAdmin(HutCommonAdmin):
    form = HutForm
    list_display = ('name', 'agency_id', 'updated', 'published')
    list_filter = ('published', 'updated', 'discretion', 'overnight', 'types', 'state')

class HutSuggestionAdmin(HutCommonAdmin):
    form = HutSuggestionForm
    actions = ['publish']

    def publish(self, request, queryset):
        field_names = set(Hut._meta.get_all_field_names()) & set(HutSuggestion._meta.get_all_field_names())
        for hut_suggestion in queryset:
            hut = Hut()
            for field_name in field_names:
                value = getattr(hut_suggestion, field_name)
                setattr(hut, field_name, value)
            hut.published = True
            hut.save()
        num_huts = len(queryset)
        queryset.delete()
        self.message_user(request, '{} hut suggestions successfully published.'.format(num_huts))
    publish.short_description = 'Publish selected hut suggestions'

class HutEditAdmin(HutCommonAdmin):
    form = HutEditForm
    change_form_template = 'admin/huts/hut_edit/change_form.html'
    actions = ['accept']

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}

        hut = HutEdit.objects.get(pk=object_id)
        related_hut = hut.hut
        related_hut_form = HutForm(instance=related_hut, prefix='dontsave')

        field_names = set(hut._meta.get_all_field_names()) & set(related_hut_form.fields.iterkeys())
        extra_context['differing_fields'] = []
        extra_context['test'] = []
        for field_name in field_names:
            field = related_hut_form.fields[field_name]
            field.widget.attrs['disabled'] = ''

            hut_value = getattr(hut, field_name)
            related_value = getattr(related_hut, field_name)
            is_m2m = HutEdit._meta.get_field_by_name(field_name)[3]
            if is_m2m:
                hut_value = set(hut_value.all())
                related_value = set(related_value.all())
            if hut_value != related_value:
                extra_context['differing_fields'].append(field_name)

        extra_context['related_hut'] = related_hut_form
        return super(HutEditAdmin, self).change_view(request, object_id,
          form_url, extra_context=extra_context)

    def accept(self, request, queryset):
        field_names = set(Hut._meta.get_all_field_names()) & set(HutEdit._meta.get_all_field_names())
        for hut_edit in queryset:
            hut = hut_edit.hut
            for field_name in field_names:
                value = getattr(hut_edit, field_name)
                setattr(hut, field_name, value)
            hut.published = True
            hut.save()
        num_huts = len(queryset)
        queryset.delete()
        self.message_user(request, '{} hut edits successfully accepted.'.format(num_huts))
    accept.short_description = 'Accept selected hut edits'

class AgencyAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'updated')
    list_filter = ('updated', 'parent')
    search_fields = ('name', 'parent__name')

admin.site.register(Region, RegionAdmin)
admin.site.register(Designation, DesignationAdmin)
admin.site.register(System, SystemAdmin)
admin.site.register(AccessType, AccessTypeAdmin)
admin.site.register(HutType, HutTypeAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Hut, HutAdmin)
admin.site.register(HutSuggestion, HutSuggestionAdmin)
admin.site.register(HutEdit, HutEditAdmin)
admin.site.register(Agency, AgencyAdmin)
